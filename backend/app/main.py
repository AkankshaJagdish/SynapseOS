# DO NOT MODIFY — skeleton only. Add logic in routers/.

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import dashboard, observations

PORT = int(os.environ.get("PORT", 8000))


@asynccontextmanager
async def lifespan(_app: FastAPI):
    print("SynapseOS API starting...")
    yield


app = FastAPI(title="SynapseOS API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(observations.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}
