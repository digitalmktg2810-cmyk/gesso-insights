export type City = { name: string; lat: number; lng: number };

/** Loja: centro de Pirassununga-SP. */
export const STORE: City = { name: "Pirassununga", lat: -21.9961, lng: -47.4258 };

/** Instagram e Facebook: raio em volta de Pirassununga (conjunto "Pirassununga 25km"). */
export const META_AREA = { center: STORE, radiusKm: 25 };

/** Google: cidades escolhidas na campanha inteligente. */
export const GOOGLE_CITIES: City[] = [
  STORE,
  { name: "Leme", lat: -22.1858, lng: -47.3903 },
  { name: "Porto Ferreira", lat: -21.8539, lng: -47.4789 },
];
