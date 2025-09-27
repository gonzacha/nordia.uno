from fastapi import APIRouter, Depends

from ..deps import get_brand_with_request
from services import data_loader

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
async def get_dashboard(brand=Depends(get_brand_with_request)):
    summary = data_loader.load_summary()
    jobs = data_loader.load_jobs()
    return {
        "tenant": brand["id"],
        "brand": brand,
        "summary": summary,
        "jobs": jobs,
    }


@router.get("/jobs")
async def get_jobs():
    return data_loader.load_jobs()


@router.get("/reports")
async def get_reports():
    return data_loader.list_reports()
