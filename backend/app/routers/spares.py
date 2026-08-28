from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import SparePart, SparePartTransaction, Transaction
from app.schemas import SpareCreate, SpareInOut, SpareUpdate
from app.utils import generate_code, model_to_dict, next_tx_ref

router = APIRouter()


@router.get("/spares")
def list_spares(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    category: str = "",
    maker: str = "",
    db: Session = Depends(get_db),
):
    where = []
    if keyword:
        kw = f"%{keyword}%"
        where.append(
            or_(
                SparePart.code.like(kw),
                SparePart.name.like(kw),
                SparePart.drawing_number.like(kw),
                SparePart.maker.like(kw),
                SparePart.category.like(kw),
                SparePart.model.like(kw),
            )
        )
    if category:
        where.append(SparePart.category.like(f"%{category}%"))
    if maker:
        where.append(SparePart.maker.like(f"%{maker}%"))
    total = db.execute(select(func.count()).select_from(SparePart).where(*where)).scalar_one()
    stmt = select(SparePart).where(*where).order_by(SparePart.code.asc())
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).scalars().all()
    return {
        "items": [model_to_dict(r) for r in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/spares")
def create_spare(body: SpareCreate, db: Session = Depends(get_db)):
    code = generate_code(db, "S")
    sp = SparePart(
        code=code,
        name=body.name,
        category=body.category,
        drawing_number=body.drawing_number,
        maker=body.maker,
        model=body.model,
        quantity=body.quantity,
        min_stock_alert=body.min_stock_alert,
        location=body.location,
        notes=body.notes,
    )
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return model_to_dict(sp)


@router.put("/spares/{spare_id}")
def update_spare(spare_id: int, body: SpareUpdate, db: Session = Depends(get_db)):
    sp = db.get(SparePart, spare_id)
    if not sp:
        raise HTTPException(status_code=404, detail="not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(sp, key, value)
    sp.updated_at = datetime.now()
    db.commit()
    db.refresh(sp)
    return model_to_dict(sp)


@router.delete("/spares/{spare_id}")
def delete_spare(spare_id: int, db: Session = Depends(get_db)):
    sp = db.get(SparePart, spare_id)
    if not sp:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(sp)
    db.commit()
    return {"success": True}


def _spare_io(db: Session, sp: SparePart, body: SpareInOut, direction: str) -> dict:
    if body.quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity > 0")
    if direction == "out" and body.quantity > sp.quantity:
        raise HTTPException(status_code=400, detail=f"insufficient: {sp.quantity}")
    sp.quantity += body.quantity if direction == "in" else -body.quantity
    db.add(
        SparePartTransaction(
            spare_part_id=sp.id,
            type=direction,
            quantity=body.quantity,
            operator=body.operator,
            purpose=body.purpose,
            balance_after=sp.quantity,
            notes=body.notes,
        )
    )
    db.add(
        Transaction(
            ref_no=next_tx_ref(db),
            spare_part_id=sp.id,
            item_code=sp.code,
            item_name=sp.name,
            item_type="spare",
            tx_type="入库" if direction == "in" else "出库",
            quantity=body.quantity,
            operator=body.operator,
            dept="",
            note=body.notes,
            created_at=datetime.now(),
        )
    )
    db.commit()
    return {"success": True, "new_quantity": sp.quantity}


@router.post("/spares/{spare_id}/in")
def spare_in(spare_id: int, body: SpareInOut, db: Session = Depends(get_db)):
    sp = db.get(SparePart, spare_id)
    if not sp:
        raise HTTPException(status_code=404, detail="not found")
    return _spare_io(db, sp, body, "in")


@router.post("/spares/{spare_id}/out")
def spare_out(spare_id: int, body: SpareInOut, db: Session = Depends(get_db)):
    sp = db.get(SparePart, spare_id)
    if not sp:
        raise HTTPException(status_code=404, detail="not found")
    return _spare_io(db, sp, body, "out")
