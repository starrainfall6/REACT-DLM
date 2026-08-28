from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import BorrowRecord, Item, Transaction
from app.schemas import BorrowRequest, ItemCreate, ItemUpdate, ReturnRequest
from app.utils import (
    generate_code,
    get_available_quantity,
    model_to_dict,
    next_record_ref,
    next_tx_ref,
    update_overdue,
)

router = APIRouter()

ITEM_COLS = (
    Item.id,
    Item.code,
    Item.name,
    Item.type,
    Item.category,
    Item.drawing_number,
    Item.brand,
    Item.model,
    Item.spec,
    Item.quantity,
    Item.location,
    Item.status,
    Item.min_stock_alert,
    Item.notes,
    Item.created_at,
    Item.updated_at,
)


def outstanding_subquery():
    return (
        select(func.coalesce(func.sum(BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity), 0))
        .where(
            BorrowRecord.item_id == Item.id,
            BorrowRecord.status.in_(["active", "overdue"]),
        )
        .correlate(Item)
        .scalar_subquery()
    )


@router.get("/items")
def list_items(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    status: str = "",
    category: str = "",
    type: str = "",
    db: Session = Depends(get_db),
):
    update_overdue(db)
    where = []
    if type:
        where.append(Item.type == type)
    if status:
        where.append(Item.status == status)
    if category:
        where.append(Item.category == category)
    if keyword:
        kw = f"%{keyword}%"
        where.append(
            or_(
                Item.code.like(kw),
                Item.name.like(kw),
                Item.drawing_number.like(kw),
                Item.brand.like(kw),
                Item.category.like(kw),
                Item.model.like(kw),
                Item.spec.like(kw),
            )
        )
    total = db.execute(select(func.count()).select_from(Item).where(*where)).scalar_one()
    stmt = (
        select(*ITEM_COLS, outstanding_subquery().label("borrowed_qty"))
        .where(*where)
        .order_by(Item.code.asc())
    )
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).all()
    items = []
    for r in rows:
        d = dict(r._mapping)
        d["borrowed_qty"] = int(d.get("borrowed_qty") or 0)
        items.append(d)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/items/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    return model_to_dict(item)


@router.post("/items")
def create_item(body: ItemCreate, db: Session = Depends(get_db)):
    code = generate_code(db, "T" if body.type == "tool" else "F")
    item = Item(
        code=code,
        name=body.name,
        type=body.type,
        category=body.category,
        drawing_number=body.drawing_number,
        brand=body.brand,
        model=body.model,
        spec=body.spec,
        quantity=body.quantity,
        location=body.location,
        min_stock_alert=body.min_stock_alert,
        notes=body.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.put("/items/{item_id}")
def update_item(item_id: int, body: ItemUpdate, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(item, key, value)
    item.updated_at = datetime.now()
    db.commit()
    db.refresh(item)
    return model_to_dict(item)


@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(item)
    db.commit()
    return {"success": True}


@router.post("/items/{item_id}/borrow")
def borrow_item(item_id: int, body: BorrowRequest, db: Session = Depends(get_db)):
    borrower = body.borrower_name.strip()
    if not borrower:
        raise HTTPException(status_code=400, detail="borrower_name required")
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    avail = get_available_quantity(db, item_id)
    if body.borrow_quantity > avail:
        raise HTTPException(status_code=400, detail=f"insufficient: available={avail}")
    expected = None
    if body.expected_return_date:
        expected = datetime.strptime(body.expected_return_date, "%Y-%m-%d")
    else:
        expected = datetime.now() + timedelta(days=7)
    rec = BorrowRecord(
        ref_no=next_record_ref(db),
        item_id=item_id,
        borrower_name=borrower,
        borrower_dept=body.borrower_dept,
        purpose=body.purpose,
        borrow_date=datetime.now(),
        expected_return_date=expected,
        borrow_quantity=body.borrow_quantity,
    )
    db.add(rec)
    if get_available_quantity(db, item_id) <= 0:
        item.status = "borrowed"
    db.add(
        Transaction(
            ref_no=next_tx_ref(db),
            item_id=item.id,
            item_code=item.code,
            item_name=item.name,
            item_type=item.type,
            tx_type="出库",
            quantity=body.borrow_quantity,
            operator=borrower,
            dept=body.borrower_dept,
            note=body.note or body.purpose,
            created_at=datetime.now(),
        )
    )
    db.commit()
    db.refresh(rec)
    return model_to_dict(rec)


@router.post("/items/{item_id}/return")
def return_item(item_id: int, body: ReturnRequest, db: Session = Depends(get_db)):
    if body.record_no:
        # 按借出单号精确归还（兼容数字主键）
        cond = BorrowRecord.ref_no == body.record_no
        if body.record_no.isdigit():
            cond = cond | (BorrowRecord.id == int(body.record_no))
        rec = db.execute(
            select(BorrowRecord)
            .where(
                BorrowRecord.item_id == item_id,
                BorrowRecord.status.in_(["active", "overdue"]),
                BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity > 0,
                cond,
            )
            .limit(1)
        ).scalar_one_or_none()
    else:
        # 兼容旧调用：未指定单号时归还最早的一笔活跃借出单
        rec = db.execute(
            select(BorrowRecord)
            .where(
                BorrowRecord.item_id == item_id,
                BorrowRecord.status.in_(["active", "overdue"]),
                BorrowRecord.borrow_quantity - BorrowRecord.returned_quantity > 0,
            )
            .order_by(BorrowRecord.borrow_date.asc())
            .limit(1)
        ).scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=400, detail="未找到对应的活跃借出单")
    if rec.item_id != item_id:
        raise HTTPException(status_code=400, detail="借出单不属于该物品")
    remaining = rec.borrow_quantity - rec.returned_quantity
    rqty = min(body.return_quantity, remaining)
    rec.returned_quantity += rqty
    rec.actual_return_date = datetime.now()
    if rec.returned_quantity >= rec.borrow_quantity:
        rec.status = "returned"
    item = db.get(Item, item_id)
    if item and get_available_quantity(db, item_id) > 0:
        item.status = "available"
    db.add(
        Transaction(
            ref_no=next_tx_ref(db),
            item_id=item_id,
            item_code=item.code,
            item_name=item.name,
            item_type=item.type,
            tx_type="入库",
            quantity=rqty,
            operator=body.operator or rec.borrower_name,
            dept=rec.borrower_dept,
            note=body.note,
            created_at=datetime.now(),
        )
    )
    db.commit()
    db.refresh(rec)
    return {"returned": True, "returned_quantity": rec.returned_quantity}
