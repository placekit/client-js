export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit(apiKey?: string, opts?: PKOptions): PKClient;

export interface PKClient {
  search(query: string, opts?: PKOptions): Promise<PKSearchResponse>;
  reverse(opts?: PKOptions): Promise<PKSearchResponse>;
  readonly options: PKOptions;
  configure(opts?: PKOptions): void;
  readonly hasGeolocation: boolean;
  requestGeolocation(opts?: Object): Promise<GeolocationPosition>;
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
  timeout?: number;
  maxResults?: number;
  language?: "fr" | "en";
  types?: PKType[];
  countries?: string[];
  countryByIP?: boolean;
  forwardIP?: string;
  coordinates?: string;
}>;

export type PKResult = {
  name: string,
  city: string,
  county: string,
  administrative: string,
  country: string,
  countrycode: string;
  lat: number,
  lng: number,
  type: string,
  zipcode: string[],
  population: number,
  highlight: string;
};

export type PKSearchResponse = {
  results: PKResult[];
  resultsCount: number;
  maxResults: number;
  query: string;
};