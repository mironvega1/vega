import { latLngToCell, cellToLatLng, gridDisk, cellToBoundary } from "h3-js";

export const H3_RES_NEIGHBORHOOD = 8;
export const H3_RES_DISTRICT = 6;

export function coordToH3(lat: number, lng: number, resolution = H3_RES_NEIGHBORHOOD): string {
  return latLngToCell(lat, lng, resolution);
}

export function h3ToCoord(h3Index: string): { lat: number; lng: number } {
  const [lat, lng] = cellToLatLng(h3Index);
  return { lat, lng };
}

export function getNeighborCells(h3Index: string, k = 1): string[] {
  return gridDisk(h3Index, k);
}

export function h3ToBoundary(h3Index: string): Array<[number, number]> {
  return cellToBoundary(h3Index);
}

export function enrichWithH3(lat: number, lng: number): {
  h3_res8: string;
  h3_res6: string;
} {
  return {
    h3_res8: coordToH3(lat, lng, H3_RES_NEIGHBORHOOD),
    h3_res6: coordToH3(lat, lng, H3_RES_DISTRICT),
  };
}