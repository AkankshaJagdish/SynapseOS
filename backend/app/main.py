"""SynapseOS single FastAPI backend and shared service container."""

from contextlib import asynccontextmanager
from dataclasses import dataclass
import os
from pathlib import Path
import sqlite3
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

VERSION = "0.1.0"


@dataclass(frozen=True)
class Settings:
    """Environment-backed application configuration with safe demo defaults."""

    database_path: Path
    demo_mode: bool
    frontend_origin: str

    @classmethod
    def from_environment(cls) -> "Settings":
        return cls(
            database_path=Path(os.getenv("SYNAPSE_DATABASE_PATH", "data/synapse.db")),
            demo_mode=os.getenv("DEMO_MODE", "true").lower() in {"1", "true", "yes", "on"},
            frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:3000"),
        )


class Database:
    """The application's only database connection factory."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS system_metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
                """
            )
            connection.execute(
                "INSERT OR REPLACE INTO system_metadata (key, value) VALUES (?, ?)",
                ("schema_version", "1"),
            )

    def is_ready(self) -> bool:
        try:
            with self.connect() as connection:
                return connection.execute("SELECT 1").fetchone()[0] == 1
        except sqlite3.Error:
            return False


class MemoryService:
    """Single extension point for organizational memory."""

    def __init__(self, database: Database) -> None:
        self.database = database


class SignalService:
    """Single extension point for employee-observed signals."""

    def __init__(self, memory: MemoryService) -> None:
        self.memory = memory


class AgentOrchestrator:
    """Single extension point for future agent coordination."""

    def __init__(self, signals: SignalService, memory: MemoryService) -> None:
        self.signals = signals
        self.memory = memory


@dataclass(frozen=True)
class Services:
    database: Database
    memory: MemoryService
    signals: SignalService
    agents: AgentOrchestrator


def build_services(settings: Settings) -> Services:
    """Build the application's one shared service graph."""
    database = Database(settings.database_path)
    memory = MemoryService(database)
    signals = SignalService(memory)
    return Services(database, memory, signals, AgentOrchestrator(signals, memory))


settings = Settings.from_environment()
services = build_services(settings)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    services.database.initialize()
    yield


app = FastAPI(title="SynapseOS API", version=VERSION, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/ready", tags=["system"])
def ready() -> dict[str, str]:
    if not services.database.is_ready():
        raise HTTPException(status_code=503, detail="Database is not ready")
    return {"status": "ready"}


@app.get("/version", tags=["system"])
def version() -> dict[str, str | bool]:
    return {"version": VERSION, "demo_mode": settings.demo_mode}
