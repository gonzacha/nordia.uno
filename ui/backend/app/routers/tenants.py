from fastapi import APIRouter

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("")
async def list_tenants():
    return [
        {"id": "default", "name": "Nordia ISP Suite"},
        {"id": "telecorr", "name": "TeleCorrientes SA"},
        {"id": "isp_demo", "name": "Demo ISP"},
    ]
