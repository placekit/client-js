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
  timeout: number;
  maxResults: number;
  language?: string;
  type?: "city" | "country" | "address" | "busStop" | "trainStation" | "townhall" | "airport";
  countries?: string[];
  coordinates?: string;
}>;

export type PKSearchResponse = {
  results: any[];
};