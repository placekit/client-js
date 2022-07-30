export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit({ appId, apiKey, options }?: {
  appId: string;
  apiKey: string;
  options: Partial<PKOptions>;
}): PKClient;

export interface PKClient {
  (query: string, opts?: Partial<PKOptions>): Promise<PKResponse>;
  readonly options: PKOptions;
  configure(opts?: Partial<PKOptions>): void;
  readonly hasGeolocation: boolean;
  requestGeolocation(timeout?: number): Promise<GeolocationPosition>;
}

export type PKOptions = {
  retryTimeout: number;
  language: string;
  countries: string[];
  type: string;
  hitsPerPage: number;
  postcodeSearch: boolean;
  aroundLatLng: string;
  aroundLatLngViaIP: boolean;
  aroundRadius: number;
  insideBoundingBox: string;
  insidePolygon: string;
  getRankingInfo: string;
  computeQueryParams: any;
};

export type PKResponse = {
  hits: any[];
};