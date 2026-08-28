from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Item(Base):
    __tablename__ = "items"
    __table_args__ = (
        CheckConstraint("type IN ('tool','fixture')", name="ck_items_type"),
        CheckConstraint("status IN ('available','borrowed')", name="ck_items_status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="tool")
    category: Mapped[str] = mapped_column(String(100), default="")
    drawing_number: Mapped[str] = mapped_column(String(100), default="")
    brand: Mapped[str] = mapped_column(String(100), default="")
    model: Mapped[str] = mapped_column(String(100), default="")
    spec: Mapped[str] = mapped_column(String(100), default="")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(20), default="available")
    min_stock_alert: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    borrow_records: Mapped[list["BorrowRecord"]] = relationship(
        back_populates="item", passive_deletes=True
    )


class SparePart(Base):
    __tablename__ = "spare_parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="")
    drawing_number: Mapped[str] = mapped_column(String(100), default="")
    maker: Mapped[str] = mapped_column(String(100), default="")
    model: Mapped[str] = mapped_column(String(100), default="")
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    min_stock_alert: Mapped[int] = mapped_column(Integer, default=0)
    location: Mapped[str] = mapped_column(String(100), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class BorrowRecord(Base):
    __tablename__ = "borrow_records"
    __table_args__ = (
        CheckConstraint("status IN ('active','returned','overdue')", name="ck_borrow_status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ref_no: Mapped[str] = mapped_column(String(40), unique=True, default="")
    item_id: Mapped[int] = mapped_column(
        ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    borrower_name: Mapped[str] = mapped_column(String(100), nullable=False)
    borrower_dept: Mapped[str] = mapped_column(String(100), default="")
    purpose: Mapped[str] = mapped_column(String(200), default="")
    borrow_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expected_return_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    actual_return_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    borrow_quantity: Mapped[int] = mapped_column(Integer, default=1)
    returned_quantity: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str] = mapped_column(Text, default="")

    item: Mapped[Item] = relationship(back_populates="borrow_records")


class SparePartTransaction(Base):
    __tablename__ = "spare_part_transactions"
    __table_args__ = (
        CheckConstraint("type IN ('in','out')", name="ck_sptx_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    spare_part_id: Mapped[int] = mapped_column(
        ForeignKey("spare_parts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    operator: Mapped[str] = mapped_column(String(100), default="")
    purpose: Mapped[str] = mapped_column(String(200), default="")
    balance_after: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Transaction(Base):
    """统一出入库流水：工具/治具借用归还 + 备品出入库 + 盘点调整。"""

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ref_no: Mapped[str] = mapped_column(String(40), unique=True, default="")
    item_id: Mapped[int | None] = mapped_column(
        ForeignKey("items.id", ondelete="SET NULL"), nullable=True, index=True
    )
    spare_part_id: Mapped[int | None] = mapped_column(
        ForeignKey("spare_parts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    item_code: Mapped[str] = mapped_column(String(20), default="")
    item_name: Mapped[str] = mapped_column(String(200), default="")
    item_type: Mapped[str] = mapped_column(String(20), default="")
    tx_type: Mapped[str] = mapped_column(String(10), default="")  # 入库/出库
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    operator: Mapped[str] = mapped_column(String(100), default="")
    dept: Mapped[str] = mapped_column(String(100), default="")
    note: Mapped[str] = mapped_column(Text, default="")  # 备注（借出用途/归还说明/出入库备注）
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ConfigItem(Base):
    __tablename__ = "config"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), default="")
    role: Mapped[str] = mapped_column(String(20), default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class InventoryCheck(Base):
    __tablename__ = "inventory_checks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ref_no: Mapped[str] = mapped_column(String(40), default="")
    check_type: Mapped[str] = mapped_column(String(20), default="")  # 全面盘点/循环盘点/抽检盘点/年度/月度
    project: Mapped[str] = mapped_column(String(20), default="")  # 工具/治具/备品
    check_time: Mapped[str] = mapped_column(String(40), default="")
    person: Mapped[str] = mapped_column(String(50), default="")
    result: Mapped[str] = mapped_column(String(50), default="")
    note: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="待同步")  # 待同步/已同步
    sync_time: Mapped[str] = mapped_column(String(40), default="—")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
