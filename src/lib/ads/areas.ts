export type City = { name: string; lat: number; lng: number };
export type MetaArea = { city: City; radiusKm: number; focus: "principal" | "reduzido" };

/** Loja: centro de Pirassununga-SP. */
export const STORE: City = { name: "Pirassununga", lat: -21.9961, lng: -47.4258 };
export const LEME: City = { name: "Leme", lat: -22.1858, lng: -47.3903 };
export const PORTO_FERREIRA: City = { name: "Porto Ferreira", lat: -21.8539, lng: -47.4789 };

/** Instagram e Facebook a partir de 29/10: Pirassununga +15 mi (24 km), pega Leme e Porto Ferreira. */
export const META_AREAS: MetaArea[] = [
  { city: STORE, radiusKm: 24, focus: "principal" }, // 15 milhas, R$ 14/dia
];
/** Raio usado só para desenhar no mapa quando a área é "só a cidade". */
export const CITY_DRAW_KM = 5;

/** Google: cidades da campanha. */
export const GOOGLE_CITIES: City[] = [LEME, PORTO_FERREIRA, STORE];
