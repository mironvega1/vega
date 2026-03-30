import csv
import io
import h3
from datetime import datetime
from typing import Optional
from app.core.supabase import supabase


REQUIRED_COLUMNS = ["fiyat", "net_m2", "ilce", "mahalle"]

COLUMN_ALIASES = {
    "fiyat": ["fiyat", "price", "tutar", "satis_fiyati"],
    "net_m2": ["net_m2", "net m2", "alan", "metrekare"],
    "brut_m2": ["brut_m2", "brut m2", "brut"],
    "oda_sayisi": ["oda_sayisi", "oda", "room"],
    "kat_no": ["kat_no", "kat", "floor"],
    "toplam_kat": ["toplam_kat", "bina_kat"],
    "ilce": ["ilce", "ilçe", "district"],
    "mahalle": ["mahalle", "neighborhood"],
    "il": ["il", "sehir", "şehir", "city"],
    "adres": ["adres", "address"],
    "bina_yasi": ["bina_yasi", "bina yaşı", "yil"],
    "cephe": ["cephe", "facade"],
    "lat": ["lat", "latitude", "enlem"],
    "lng": ["lng", "lon", "longitude", "boylam"],
}


def normalize_columns(headers: list[str]) -> dict[str, str]:
    """CSV kolonlarını standart isimlere çevir."""
    mapping = {}
    headers_lower = [h.lower().strip() for h in headers]

    for standard_col, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in headers_lower:
                original = headers[headers_lower.index(alias)]
                mapping[original] = standard_col
                break

    return mapping


def parse_price(value: str) -> Optional[float]:
    if not value:
        return None
    cleaned = value.replace(".", "").replace(",", "").replace("₺", "").replace("TL", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_float(value: str) -> Optional[float]:
    if not value:
        return None
    try:
        return float(value.replace(",", ".").strip())
    except ValueError:
        return None


def parse_int(value: str) -> Optional[int]:
    if not value:
        return None
    try:
        return int(float(value.strip()))
    except ValueError:
        return None


def get_h3_indexes(lat: float, lng: float) -> dict:
    return {
        "h3_res8": h3.latlng_to_cell(lat, lng, 8),
        "h3_res6": h3.latlng_to_cell(lat, lng, 6),
    }


async def import_csv(
    file_content: bytes,
    agency_id: str,
    listing_type: str = "satilik"
) -> dict:
    results = {"success": 0, "error": 0, "errors": []}

    try:
        content = file_content.decode("utf-8-sig")
    except UnicodeDecodeError:
        content = file_content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(content))
    headers = reader.fieldnames or []
    col_map = normalize_columns(list(headers))

    rows = list(reader)
    if not rows:
        return {"success": 0, "error": 0, "errors": ["CSV boş"]}

    batch = []

    for i, row in enumerate(rows):
        try:
            normalized = {}
            for original_col, value in row.items():
                standard_col = col_map.get(original_col, original_col.lower().strip())
                normalized[standard_col] = value.strip() if value else ""

            fiyat = parse_price(normalized.get("fiyat", ""))
            if not fiyat:
                results["error"] += 1
                results["errors"].append(f"Satır {i+2}: Fiyat geçersiz")
                continue

            listing = {
                "agency_id": agency_id,
                "source": "csv_import",
                "listing_type": listing_type,
                "property_type": "daire",
                "fiyat": fiyat,
                "fiyat_doviz": "TRY",
                "durum": "active",
                "net_m2": parse_float(normalized.get("net_m2", "")),
                "brut_m2": parse_float(normalized.get("brut_m2", "")),
                "oda_sayisi": normalized.get("oda_sayisi") or None,
                "kat_no": parse_int(normalized.get("kat_no", "")),
                "toplam_kat": parse_int(normalized.get("toplam_kat", "")),
                "bina_yasi": parse_int(normalized.get("bina_yasi", "")),
                "cephe": normalized.get("cephe") or None,
                "adres_acik": normalized.get("adres") or None,
            }

            # Konum varsa H3 hesapla
            lat = parse_float(normalized.get("lat", ""))
            lng = parse_float(normalized.get("lng", ""))

            if lat and lng:
                h3_indexes = get_h3_indexes(lat, lng)
                listing["h3_res8"] = h3_indexes["h3_res8"]
                listing["h3_res6"] = h3_indexes["h3_res6"]
                listing["geom"] = f"POINT({lng} {lat})"

            batch.append(listing)

            # Her 50 satırda bir Supabase'e yaz
            if len(batch) >= 50:
                response = supabase.schema("vega").table("listings").insert(batch).execute()
            
                results["success"] += len(batch)
                batch = []

        except Exception as e:
            results["error"] += 1
            results["errors"].append(f"Satır {i+2}: {str(e)}")

    # Kalan kayıtları yaz
    if batch:
        supabase.schema("vega").table("listings").insert(batch).execute()
        results["success"] += len(batch)

    return results
    