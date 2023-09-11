export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit(apiKey?: string, opts?: PKOptions): PKClient;

export type PKClient = {
  readonly options: PKOptions;
  readonly hasGeolocation: boolean;
  search(query: string, opts?: PKOptions): Promise<PKSearchResponse>;
  reverse(opts?: PKOptions): Promise<PKSearchResponse>;
  configure(opts?: PKOptions): void;
  requestGeolocation(opts?: Object): Promise<GeolocationPosition>;
  clearGeolocation(): void;
};

type PKType = "airport" | "bus" | "city" | "country" | "street" | "tourism" | "townhall" | "train";
type PKTypeFilter = PKType | "-airport" | "-bus" | "-city" | "-country" | "-street" | "-tourism" | "-townhall" | "-train";

export type PKOptions = {
  timeout?: number;
  maxResults?: number;
  language?: string;
  types?: PKTypeFilter[];
  countries?: string[];
  forwardIP?: string;
  coordinates?: string;
};

export type PKResult = {
  street?: {
    number: string;
    suffix: string;
    name: string;
  };
  name: string;
  city: string;
  county: string;
  administrative: string;
  country: string;
  countrycode: string;
  coordinates: string; // "lat,lng"
  lat?: number; // deprecated
  lng?: number; // deprecated
  type: PKType;
  zipcode: string[];
  population: number;
  highlight: string;
};

export type PKSearchResponse = {
  results: PKResult[];
  resultsCount: number;
  maxResults: number;
  query: string;
};