from typing import Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = Field(default="tool", pattern="^(tool|fixture)$")
    category: str = ""
    drawing_number: str = ""
    brand: str = ""
    model: str = ""
    spec: str = ""
    quantity: int = Field(default=1, ge=1)
    location: str = ""
    min_stock_alert: int = 0
    notes: str = ""


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    drawing_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    spec: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=1)
    location: Optional[str] = None
    min_stock_alert: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class BorrowRequest(BaseModel):
    borrower_name: str = Field(..., min_length=1)
    borrower_dept: str = ""
    borrow_quantity: int = Field(default=1, ge=1)
    purpose: str = ""
    expected_return_date: Optional[str] = None
    operator: str = ""
    note: str = ""


class ReturnRequest(BaseModel):
    """归还：按借出单号归还（record_no 为空时回退到最早的一笔活跃借出单）。"""

    record_no: str = ""
    return_quantity: int = Field(default=1, ge=1)
    operator: str = ""
    note: str = ""


class SpareCreate(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = ""
    drawing_number: str = ""
    maker: str = ""
    model: str = ""
    quantity: int = Field(default=0, ge=0)
    min_stock_alert: int = 0
    location: str = ""
    notes: str = ""


class SpareUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    drawing_number: Optional[str] = None
    maker: Optional[str] = None
    model: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    min_stock_alert: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class SpareInOut(BaseModel):
    quantity: int = Field(..., ge=1)
    operator: str = ""
    purpose: str = ""
    notes: str = ""


class InventoryCheckCreate(BaseModel):
    type: str = ""
    project: str = ""
    time: str = ""
    person: str = ""
    result: str = ""
    note: str = ""
class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)
    display_name: str = ""
    role: str = Field(default="user", pattern="^(admin|user)$")


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = Field(default=None, pattern="^(admin|user)$")
    password: Optional[str] = Field(default=None, min_length=1)

class ProfileUpdate(BaseModel):
    """个人资料修改：登录账号 / 显示名称 / 密码（改密需校验当前密码）。"""
    username: Optional[str] = Field(default=None, min_length=1, max_length=50)
    display_name: Optional[str] = Field(default=None, max_length=100)
    old_password: Optional[str] = None
    new_password: Optional[str] = Field(default=None, min_length=1)
