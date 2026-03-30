from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from app.services.csv_importer import import_csv

router = APIRouter()

@router.post("/listings/import-csv")
async def import_listings_csv(
    file: UploadFile = File(...),
    agency_id: str = Header(...),
    listing_type: str = "satilik"
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Sadece CSV dosyası yüklenebilir")

    content = await file.read()
    result = await import_csv(content, agency_id, listing_type)

    return {
        "message": f"{result['success']} ilan başarıyla yüklendi",
        "success": result["success"],
        "error": result["error"],
        "errors": result["errors"][:10]
    }

@router.get("/listings")
async def get_listings(
    agency_id: str = Header(...),
    limit: int = 20,
    offset: int = 0
):
    from app.core.supabase import supabase
    response = supabase.schema("vega").table("listings").select("*").eq("agency_id", agency_id).eq("durum", "active").range(offset, offset + limit - 1).execute()
    return {"listings": response.data, "count": len(response.data)}