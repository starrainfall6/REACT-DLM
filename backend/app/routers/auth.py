from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User
from app.schemas import LoginRequest, ProfileUpdate
from app.security import create_access_token, decode_token, hash_password, verify_password

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="未登录")
    uid = decode_token(credentials.credentials)
    if not uid:
        raise HTTPException(status_code=401, detail="登录已过期")
    user = db.get(User, int(uid))
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


@router.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == body.username)).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(str(user.id))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "role": user.role,
        },
    }


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
    }

@router.put("/auth/profile")
def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.username is not None:
        username = body.username.strip()
        if not username:
            raise HTTPException(status_code=400, detail="登录账号不能为空")
        if username != user.username:
            exists = db.execute(
                select(User).where(User.username == username, User.id != user.id)
            ).scalar_one_or_none()
            if exists:
                raise HTTPException(status_code=400, detail="登录账号已存在")
            user.username = username
    if body.display_name is not None:
        user.display_name = body.display_name.strip()
    if body.new_password:
        if not body.old_password or not verify_password(body.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="当前密码不正确")
        user.password_hash = hash_password(body.new_password)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
    }
