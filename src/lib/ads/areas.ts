export type City = { name: string; lat: number; lng: number };
export type MetaArea = { city: City; radiusKm: number; focus: "principal" | "reduzido" };

/** Loja: centro de Pirassununga-SP. */
export const STORE: City = { name: "Pirassununga", lat: -21.9961, lng: -47.4258 };
export const LEME: City = { name: "Leme", lat: -22.1858, lng: -47.3903 };
export const PORTO_FERREIRA: City = { name: "Porto Ferreira", lat: -21.8539, lng: -47.4789 };

/** Instagram e Facebook a partir de 22/10: foco em Leme e Porto Ferreira, Pirassununga com verba reduzida. */
export const META_AREAS: MetaArea[] = [
  { city: LEME, radiusKm: 10, focus: "principal" },
  { city: PORTO_FERREIRA, radiusKm: 10, focus: "principal" },
  { city: STORE, radiusKm: 10, focus: "reduzido" },
];

/** Google: cidades da campanha. */
export const GOOGLE_CITIES: City[] = [LEME, PORTO_FERREIRA, STORE];
