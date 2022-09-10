export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit(apiKey?: string, opts?: PKOptions): PKClient;

export interface PKClient {
  search(query: string, opts?: PKOptions): Promise<PKSearchResponse>;
  readonly options: PKOptions;
  configure(opts?: PKOptions): void;
  readonly hasGeolocation: boolean;
  requestGeolocation(timeout?: number): Promise<GeolocationPosition>;
}

export type PKOptions = Partial<{
  retryTimeout: number;
  language: string;
  countries: string[];
  type: string;
  resultsPerPage: number;
  postcodeSearch: boolean;
  aroundLatLng: string;
  aroundLatLngViaIP: boolean;
  aroundRadius: number;
  insideBoundingBox: string;
  insidePolygon: string;
  getRankingInfo: string;
  computeQueryParams: any;
}>;

export type PKSearchResponse = {
  results: any[];
};