"""DemoForge API entry point."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

from middleware.auth import auth_middleware  # noqa: E402
from middleware.rate_limit import limiter  # noqa: E402
from routes.demos import router as demos_router  # noqa: E402
from routes.payments import router as payments_router  # noqa: E402

allowed_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

app = FastAPI(
    title="DemoForge API",
    description="Startup vision materializer powered by Claude AI",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.middleware("http")(auth_middleware)

app.include_router(demos_router, prefix="/api")
app.include_router(payments_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "DemoForge API"}
