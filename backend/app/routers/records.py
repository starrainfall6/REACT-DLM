from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import BorrowRecord, Item
from app.utils import model_to_dict, update_overdue

router = APIRouter()

RECORD_COLS = (
    BorrowRecord.id,
    BorrowRecord.ref_no,
    BorrowRecord.item_id,
    BorrowRecord.borrower_name,
    BorrowRecord.borrower_dept,
    BorrowRecord.purpose,
    BorrowRecord.borrow_date,
    BorrowRecord.expected_return_date,
    BorrowRecord.actual_return_date,
    BorrowRecord.borrow_quantity,
    BorrowRecord.returned_quantity,
    BorrowRecord.status,
    BorrowRecord.notes,
    Item.name.label("item_name"),
    Item.code.label("item_code"),
    Item.type.label("item_type"),
)

DATE_COLS = ("borrow_date", "expected_return_date", "actual_return_date")


def _fmt(row) -> dict:
    d = dict(row._mapping)
    for key in DATE_COLS:
        value = d.get(key)
        if value is not None and hasattr(value, "strftime"):
            d[key] = value.strftime("%Y-%m-%d")
    return d


@router.get("/records")
def list_records(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    status: str = "",
    item_type: str = "",
    date_from: str = "",
    date_to: str = "",
    db: Session = Depends(get_db),
):
    update_overdue(db)
    where = []
    if keyword:
        kw = f"%{keyword}%"
        where.append(
            or_(Item.name.like(kw), Item.code.like(kw), BorrowRecord.borrower_name.like(kw))
        )
    if status:
        where.append(BorrowRecord.status == status)
    if item_type:
        where.append(Item.type == item_type)
    if date_from:
        where.append(func.date(BorrowRecord.borrow_date) >= date_from)
    if date_to:
        where.append(func.date(BorrowRecord.borrow_date) <= date_to)
    total = (
        db.execute(
            select(func.count())
            .select_from(BorrowRecord)
            .join(Item, BorrowRecord.item_id == Item.id)
            .where(*where)
        )
        .scalar_one()
    )
    stmt = (
        select(*RECORD_COLS)
        .join(Item, BorrowRecord.item_id == Item.id)
        .where(*where)
        .order_by(BorrowRecord.borrow_date.desc())
    )
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).all()
    return {
        "items": [_fmt(r) for r in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/item-history")
def item_history(item_id: str = "", db: Session = Depends(get_db)):
    if not item_id:
        return []
    rows = db.execute(
        select(BorrowRecord)
        .where(BorrowRecord.item_id == int(item_id))
        .order_by(BorrowRecord.borrow_date.desc())
    ).scalars().all()
    return [model_to_dict(r) for r in rows]
