# REACT-DLM 仓库管理系统

企业仓库出入库管理系统，前后端分离：

- `REACT/` — React + Vite + Ant Design 前端
- `backend/` — FastAPI + PostgreSQL 后端（含部署配置 `backend/deploy/`）

## 本地开发

前端：

```bash
cd REACT
npm install
npm run dev
```

后端：

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # 按需修改数据库配置
uvicorn app.main:app --reload --port 8000
```

## 部署

服务器部署配置见 `backend/deploy/`（systemd service + nginx 配置）。