from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserUpdate
from app.security import hash_password

router = APIRouter()


def _user_dict(u: User) -> dict:
    created_at = u.created_at
    return {
        "id": u.id,
        "username": u.username,
        "display_name": u.display_name,
        "role": u.role,
        "created_at": created_at.strftime("%Y-%m-%d %H:%M") if hasattr(created_at, "strftime") else created_at,
    }


@router.get("/users")
def list_users(
    page: int = 1,
    page_size: int = 20,
    keyword: str = "",
    role: str = "",
    db: Session = Depends(get_db),
):
    where = [User.role != "super_admin"]
    if keyword:
        kw = f"%{keyword}%"
        where.append(or_(User.username.like(kw), User.display_name.like(kw)))
    if role:
        where.append(User.role == role)
    total = db.execute(select(func.count()).select_from(User).where(*where)).scalar_one()
    stmt = select(User).where(*where).order_by(User.id.asc())
    if page_size and 0 < page_size <= 1000:
        stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    rows = db.execute(stmt).scalars().all()
    return {
        "items": [_user_dict(u) for u in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/users")
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    exists = db.execute(select(User).where(User.username == body.username)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(
        username=body.username,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_dict(user)


@router.put("/users/{user_id}")
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    data = body.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    if password:
        user.password_hash = hash_password(password)
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return _user_dict(user)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user.role == "super_admin":
        raise HTTPException(status_code=400, detail="超级管理员不允许通过此接口删除")
    if user.role == "admin":
        admin_count = db.execute(
            select(func.count()).select_from(User).where(User.role == "admin")
        ).scalar_one()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="至少保留一个管理员账号")
    db.delete(user)
    db.commit()
    return {"success": True}
