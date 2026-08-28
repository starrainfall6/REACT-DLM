"""从前端 mock 数据初始化 PostgreSQL 数据库。

用法（在 backend 目录下执行）：
    python seed.py            # 幂等：items 已有数据则跳过
    python seed.py --force    # 清空并重新导入
"""
import os
import re
import sys
from datetime import datetime

from sqlalchemy import delete, func, select

from app.db import Base, SessionLocal, engine
from app.models import (
    BorrowRecord,
    ConfigItem,
    InventoryCheck,
    Item,
    SparePart,
    SparePartTransaction,
    Transaction,
    User,
)
from app.security import hash_password

DATA_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "REACT", "src", "data")
)


def read_ts_array(filepath: str, name: str) -> list[dict]:
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.search(rf"export const {name}\s*[:=]", text)
    if not m:
        return []
    eq = text.index("=", m.end())
    start = text.index("[", eq)
    depth = 0
    arr = ""
    for i in range(start, len(text)):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                arr = text[start : i + 1]
                break
    if not arr:
        return []
    return [parse_object(obj_text) for obj_text in split_objects(arr)]


def split_objects(arr: str) -> list[str]:
    objs = []
    i = 0
    while i < len(arr):
        if arr[i] == "{":
            depth = 0
            for j in range(i, len(arr)):
                if arr[j] == "{":
                    depth += 1
                elif arr[j] == "}":
                    depth -= 1
                    if depth == 0:
                        objs.append(arr[i : j + 1])
                        i = j + 1
                        break
        else:
            i += 1
    return objs


VALUE_RE = re.compile(
    r"""([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(-?\d+(?:\.\d+)?))"""
)


def parse_object(obj_text: str) -> dict:
    data = {}
    for m in VALUE_RE.finditer(obj_text):
        key, dq, sq, num = m.group(1), m.group(2), m.group(3), m.group(4)
        if dq is not None:
            data[key] = dq
        elif sq is not None:
            data[key] = sq
        elif num is not None:
            data[key] = int(num) if num.lstrip("-").isdigit() else float(num)
    return data


def parse_dt(value) -> datetime | None:
    if not value or value in ("—", "-", ""):
        return None
    value = str(value).strip()
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def normalize_tx_ref(ref: str) -> str:
    """旧式 TX-YYYYMMDDNNN → P-YYYYMMDD-NNN。"""
    m = re.fullmatch(r"TX-(\d{8})(\d{3})", ref or "")
    return f"P-{m.group(1)}-{m.group(2)}" if m else ref


def normalize_record_ref(ref: str) -> str:
    """借出单号 R-YYYYMMDD-NN → R-YYYYMMDD-NNN（三位补零）。"""
    m = re.fullmatch(r"R-(\d{8})-(\d{1,3})", ref or "")
    return f"R-{m.group(1)}-{m.group(2).zfill(3)}" if m else ref


CONFIG_DEFAULTS = {
    "inventory_interval_tool": "30",
    "inventory_interval_fixture": "30",
    "inventory_interval_spare": "30",
    "inventory_date_tool": "",
    "inventory_date_fixture": "",
    "inventory_date_spare": "",
}


def main(force: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        exists = db.execute(select(func.count()).select_from(Item)).scalar_one()
        if exists and not force:
            print(f"[seed] items 已有 {exists} 条，跳过（使用 --force 重新导入）")
            return

        if force:
            for model in (BorrowRecord, SparePartTransaction, Transaction, InventoryCheck, Item, SparePart, User, ConfigItem):
                db.execute(delete(model))
            db.commit()

        tools = read_ts_array(os.path.join(DATA_DIR, "tools.ts"), "tools")
        fixtures = read_ts_array(os.path.join(DATA_DIR, "fixtures.ts"), "fixtures")
        supplies = read_ts_array(os.path.join(DATA_DIR, "supplies.ts"), "supplies")
        records = read_ts_array(os.path.join(DATA_DIR, "records.ts"), "records")
        transactions = read_ts_array(os.path.join(DATA_DIR, "transactions.ts"), "transactions")
        inventory_orders = read_ts_array(os.path.join(DATA_DIR, "inventoryOrders.ts"), "inventoryOrders")
        print(
            f"[seed] 读取 mock：tools={len(tools)} fixtures={len(fixtures)} "
            f"supplies={len(supplies)} records={len(records)} "
            f"transactions={len(transactions)} inventory_orders={len(inventory_orders)}"
        )

        for username, password, display_name, role in (
            ("G85425", "123654", "超级管理员", "super_admin"),
            ("admin", "admin123", "系统管理员", "admin"),
            ("zhangsan", "123456", "张三", "user"),
            ("lisi", "123456", "李四", "user"),
        ):
            db.add(User(username=username, password_hash=hash_password(password), display_name=display_name, role=role))
        for key, value in CONFIG_DEFAULTS.items():
            db.add(ConfigItem(key=key, value=value))

        for t in tools:
            db.add(
                Item(
                    code=t["id"], name=t["name"], type="tool", category="", drawing_number="",
                    brand=t.get("maker", ""), model=t.get("model", ""), spec=t.get("spec", ""),
                    quantity=int(t.get("inStock", 0)), location=t.get("location", ""),
                    status="borrowed" if t.get("status") == "借出" else "available",
                    min_stock_alert=int(t.get("warn", 0)), notes=t.get("note", ""),
                )
            )
        for f in fixtures:
            db.add(
                Item(
                    code=f["id"], name=f["name"], type="fixture", category=f.get("category", ""),
                    drawing_number=f.get("drawing", ""), brand="", model="", spec=f.get("spec", ""),
                    quantity=int(f.get("inStock", 0)), location=f.get("location", ""),
                    status="borrowed" if f.get("status") == "借出" else "available",
                    min_stock_alert=int(f.get("warn", 0)), notes=f.get("note", ""),
                )
            )
        db.flush()
        items_by_code = {it.code: it for it in db.execute(select(Item)).scalars()}

        for s in supplies:
            drawing = s.get("drawing", "—")
            db.add(
                SparePart(
                    code=s["id"], name=s["name"], category=s.get("category", ""),
                    drawing_number="" if drawing in ("—", "-") else drawing,
                    maker=s.get("maker", ""), model=s.get("model", ""),
                    quantity=int(s.get("stock", 0)), min_stock_alert=int(s.get("warn", 0)),
                    location=s.get("location", ""), notes=s.get("note", ""),
                )
            )
        db.flush()
        spares_by_code = {sp.code: sp for sp in db.execute(select(SparePart)).scalars()}

        status_map = {"借用中": "active", "已归还": "returned", "逾期": "overdue"}
        for r in records:
            code = r["item"].rsplit(" ", 1)[-1]
            item = items_by_code.get(code)
            if not item:
                print(f"[seed] 跳过记录 {r.get('id')}: 未找到物品 {code}")
                continue
            db.add(
                BorrowRecord(
                    ref_no=normalize_record_ref(r["id"]), item_id=item.id, borrower_name=r.get("borrower", ""),
                    borrower_dept=r.get("dept", ""), purpose=r.get("purpose", ""),
                    borrow_date=parse_dt(r.get("lendDate", "")) or datetime.now(),
                    expected_return_date=parse_dt(r.get("expectReturn", "")),
                    actual_return_date=parse_dt(r.get("actualReturn", "")),
                    borrow_quantity=int(r.get("lent", 1)), returned_quantity=int(r.get("returned", 0)),
                    status=status_map.get(r.get("status", "借用中"), "active"),
                )
            )
        db.flush()

        # 根据实际未还数量修正物品状态
        for item in db.execute(select(Item)).scalars():
            out = db.execute(
                select(func.coalesce(func.sum(BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity), 0))
                .where(BorrowRecord.item_id == item.id, BorrowRecord.status.in_(["active", "overdue"]))
            ).scalar_one()
            item.status = "borrowed" if (out or 0) > 0 else "available"
        db.flush()

        for t in transactions:
            parts = t["item"].rsplit(" ", 1)
            code = parts[-1]
            name = parts[0] if len(parts) > 1 else t["item"]
            item_type = {"T": "tool", "F": "fixture", "S": "spare"}.get(code[:1], "")
            item = items_by_code.get(code) if item_type in ("tool", "fixture") else None
            sp = spares_by_code.get(code) if item_type == "spare" else None
            db.add(
                Transaction(
                    ref_no=normalize_tx_ref(t["id"]), item_id=item.id if item else None,
                    spare_part_id=sp.id if sp else None,
                    item_code=code, item_name=name, item_type=item_type,
                    tx_type=t.get("type", ""),
                    quantity=int(t.get("qty", 0)), operator=t.get("operator", ""),
                    dept=t.get("dept", ""), created_at=parse_dt(t.get("time", "")) or datetime.now(),
                    note=t.get("note", ""),
                )
            )
        db.flush()

        for io in inventory_orders:
            db.add(
                InventoryCheck(
                    ref_no=io["id"], check_type=io.get("type", ""), project=io.get("project", ""),
                    check_time=io.get("time", ""), person=io.get("person", ""),
                    status=io.get("status", "待同步"), sync_time=io.get("syncTime", "—"),
                    result="", note="",
                )
            )
        db.commit()
        print("[seed] 完成：users/config/items/spares/records/transactions/inventory_orders 已导入")
    finally:
        db.close()


if __name__ == "__main__":
    main(force="--force" in sys.argv)
