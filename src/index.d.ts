export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit(apiKey?: string, opts?: PKOptions): PKClient;

export interface PKClient {
  search(query: string, opts?: PKOptions): Promise<PKSearchResponse>;
  readonly options: PKOptions;
  configure(opts?: PKOptions): void;
  readonly hasGeolocation: boolean;
  requestGeolocation(opts?: any): Promise<GeolocationPosition>;
}

type PKType = 
  "street" | 
  "city" | 
  "country" | 
  "airport" | 
  "bus" | 
  "train" | 
  "townhall" | 
  "tourism" | 
  "-street" | 
  "-city" | 
  "-country" | 
  "-airport" | 
  "-bus" | 
  "-train" | 
  "-townhall" | 
  "-tourism";

export type PKOptions = Partial<{
  timeout: number;
  maxResults: number;
  language?: string;
  types?: PKType[];
  countries?: string[];
  coordinates?: string;
}>;

export type PKSearchResponse = {
  results: any[];
};