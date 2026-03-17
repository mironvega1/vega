export type ListingType = "satilik" | "kiralik";
export type PropertyType = "daire" | "villa" | "arsa" | "isyeri" | "bina";
export type ListingStatus = "active" | "sold" | "rented" | "expired" | "deleted";
export type UserRole = "agent" | "manager" | "admin";
export type AgencyPlan = "trial" | "starter" | "pro" | "enterprise";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface H3Index {
  h3_res8: string;
  h3_res6: string;
}

export interface Listing {
  id: string;
  external_id?: string;
  source: string;
  agency_id?: string;
  location_id?: number;
  geom?: Coordinates;
  h3_res8?: string;
  adres_acik?: string;
  bina_adi?: string;
  kat_no?: number;
  toplam_kat?: number;
  cephe?: string;
  listing_type: ListingType;
  property_type: PropertyType;
  brut_m2?: number;
  net_m2?: number;
  oda_sayisi?: string;
  fiyat: number;
  fiyat_doviz: string;
  durum: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ValuationResult {
  listing_id: string;
  tahmin_fiyat: number;
  alt_aralik: number;
  ust_aralik: number;
  guven_skoru: number;
  tahmini_satis_gun: number;
  likidite_skoru: number;
  shap_values: Record<string, number>;
  model_version: string;
}

export interface ZoneScore {
  h3_index: string;
  okul_skoru: number;
  hastane_skoru: number;
  ulasim_skoru: number;
  gurultu_skoru: number;
  yesil_alan_skoru: number;
  avm_skoru: number;
  metro_skoru: number;
  genel_yasam_skoru: number;
  ortalama_fiyat_m2: number;
  aktif_ilan_sayisi: number;
}
