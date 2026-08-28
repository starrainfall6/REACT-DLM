from app.routers.auth import router as auth_router
from app.routers.config import router as config_router
from app.routers.inventory import router as inventory_router
from app.routers.items import router as items_router
from app.routers.records import router as records_router
from app.routers.spares import router as spares_router
from app.routers.stats import router as stats_router
from app.routers.transactions import router as transactions_router
from app.routers.users import router as users_router

ROUTERS = [
    auth_router,
    stats_router,
    items_router,
    spares_router,
    records_router,
    transactions_router,
    inventory_router,
    config_router,
    users_router,
]
