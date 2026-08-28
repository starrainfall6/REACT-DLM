from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DLM Warehouse API"
    database_host: str = "127.0.0.1"
    database_port: int = 5432
    database_user: str = "dlm"
    database_password: str = "Dlm@2026!"
    database_name: str = "dlm_warehouse"
    jwt_secret: str = "dlm-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(env_file=".env", env_prefix="DLM_", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.database_user}:{quote_plus(self.database_password)}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )


settings = Settings()
