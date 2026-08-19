export type Region = "KE" | "UG" | "RW" | "TZ" | "GLOBAL";
let region: Region = "KE";
export function getRegion(): Region { return region; }
export function setRegion(r: Region) { region = r; }
