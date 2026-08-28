from datetime import date, datetime

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import BorrowRecord, InventoryCheck, Item, SparePart, Transaction


def model_to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


def generate_code(db: Session, prefix: str) -> str:
    """按前缀生成下一个编号，如 T-0005 / F-0003 / S-0011。"""
    codes: list[str] = []
    for col in (Item.code, SparePart.code):
        row = db.execute(select(col).where(col.like(f"{prefix}-%")).order_by(col.desc()).limit(1)).first()
        if row and row[0]:
            codes.append(row[0])
    num = 0
    for code in codes:
        try:
            num = max(num, int(code.split("-")[1]))
        except (IndexError, ValueError):
            continue
    return f"{prefix}-{num + 1:04d}"


def next_tx_ref(db: Session) -> str:
    """生成出入库流水号：P-YYYYMMDD-NNN（三位序号）。"""
    today = date.today().strftime("%Y%m%d")
    row = db.execute(
        select(Transaction.ref_no).where(Transaction.ref_no.like(f"P-{today}%"))
        .order_by(Transaction.ref_no.desc()).limit(1)
    ).first()
    seq = 1
    if row and row[0]:
        try:
            seq = int(str(row[0]).rsplit("-", 1)[-1]) + 1
        except (IndexError, ValueError):
            seq = 1
    return f"P-{today}-{seq:03d}"


def next_record_ref(db: Session) -> str:
    """生成借出单号：R-YYYYMMDD-NNN（三位序号）。"""
    today = date.today().strftime("%Y%m%d")
    row = db.execute(
        select(BorrowRecord.ref_no).where(BorrowRecord.ref_no.like(f"R-{today}%"))
        .order_by(BorrowRecord.ref_no.desc()).limit(1)
    ).first()
    seq = 1
    if row and row[0]:
        try:
            seq = int(str(row[0]).rsplit("-", 1)[-1]) + 1
        except (IndexError, ValueError):
            seq = 1
    return f"R-{today}-{seq:03d}"


def next_inventory_ref(db: Session) -> str:
    """生成盘点单号：PD-YYYYMMDD-NNN（三位序号）。"""
    today = date.today().strftime("%Y%m%d")
    row = db.execute(
        select(InventoryCheck.ref_no).where(InventoryCheck.ref_no.like(f"PD-{today}%"))
        .order_by(InventoryCheck.ref_no.desc()).limit(1)
    ).first()
    seq = 1
    if row and row[0]:
        try:
            seq = int(str(row[0]).rsplit("-", 1)[-1]) + 1
        except (IndexError, ValueError):
            seq = 1
    return f"PD-{today}-{seq:03d}"


def update_overdue(db: Session) -> None:
    today = date.today().strftime("%Y-%m-%d")
    db.execute(
        update(BorrowRecord)
        .where(
            BorrowRecord.status == "active",
            func.date(BorrowRecord.expected_return_date) < today,
        )
        .values(status="overdue")
    )
    db.commit()


def get_outstanding_quantity(db: Session, item_id: int) -> int:
    row = db.execute(
        select(func.coalesce(func.sum(BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity), 0))
        .where(BorrowRecord.item_id == item_id, BorrowRecord.status.in_(["active", "overdue"]))
    ).first()
    return int(row[0] or 0)


def get_available_quantity(db: Session, item_id: int) -> int:
    item = db.get(Item, item_id)
    if not item:
        return 0
    return item.quantity - get_outstanding_quantity(db, item_id)
