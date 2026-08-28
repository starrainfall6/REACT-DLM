# DLM 仓库管理系统 — 后端（FastAPI + PostgreSQL）

## 技术栈
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + psycopg2
- PostgreSQL 16
- JWT 认证（python-jose + bcrypt）

## 本地开发
1. 安装依赖（建议虚拟环境）：
   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\activate        # Windows
   pip install -r requirements.txt
   ```
2. 建立到服务器的 SSH 隧道（把服务器 5432 映射到本机 5433）：
   ```
   python scripts/db_tunnel.py
   ```
3. 复制 `.env.example` 为 `.env`（本地端口 5433）。
4. 初始化数据（幂等，`--force` 可重建）：
   ```
   python seed.py
   ```
5. 启动：
   ```
   uvicorn app.main:app --reload
   ```
   访问 http://127.0.0.1:8000/docs 查看接口文档。

## 接口概览（前缀 /api）
- `auth`：POST /auth/login、GET /auth/me（默认账号 G85425/123654 超级管理员[用户管理中隐藏]、admin/admin123）
- `stats`：GET /stats、GET /dashboard
- `items`：GET/POST /items、GET/PUT/DELETE /items/{id}、POST /items/{id}/borrow、POST /items/{id}/return（按借出单号归还，body 传 `record_no`）
- `spares`：GET/POST /spares、GET/PUT/DELETE /spares/{id}、POST /spares/{id}/in、POST /spares/{id}/out
- `records`：GET /records、GET /item-history
- `transactions`：GET /transactions（统一流水，含 `note` 备注）、GET /spare-transactions
- `inventory`：GET /inventory-days、GET/POST /inventory-checks、POST /inventory-checks/{id}/sync、DELETE /inventory-checks/{id}
- `config`：GET /config、POST /config/bulk

## 编号规则
- 借出单：`R-YYYYMMDD-NNN`（三位序号）
- 出入库流水：`P-YYYYMMDD-NNN`（三位序号）
- 盘点单：`PD-YYYYMMDD-NNN`（三位序号）

> 说明：`transactions` 表已移除 `direction` 字段并新增 `note` 备注；启动时会自动对已存在的库执行轻量字段对齐，无需手动迁移。

## 生产部署（阿里云）
1. 上传 `backend/` 到服务器 `/opt/dlm-backend`，创建 venv 并 `pip install -r requirements.txt`。
2. 创建 `/opt/dlm-backend/.env`（数据库连接指向 127.0.0.1:5432，JWT_SECRET 改成长随机串）。
3. 执行 `python seed.py` 初始化数据。
4. 安装 systemd 服务：
   ```
   cp deploy/dlm-backend.service /etc/systemd/system/
   systemctl daemon-reload && systemctl enable --now dlm-backend
   ```
5. 配置 nginx：`deploy/nginx-dlm.conf` 放入 sites-available 并软链，`systemctl reload nginx`。
6. 验证：`curl http://127.0.0.1:8000/api/health` 与 `http://<服务器IP>/api/health`。
