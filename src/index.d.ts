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
  patch: {
    search(query?: string, opts: PKPatchSearchOptions): PKPatchSearchResponse;
    create(
      address: PKPatchUpdate,
      origin?: PKResult,
      opts?: { status?: PKPatchStatus; language?: string }
    ): PKPatchResult;
    get(id: string): PKPatchResult;
    update(
      id: string,
      address: PKPatchUpdate,
      opts?: { status?: PKPatchStatus; language?: string }
    ): PKPatchResult;
    delete(id: string): void;
    delete(id: string, language: string): void;
  };
}

type PKType = 
  "airport" |
  "bus" |
  "city" |
  "country" |
  "street" |
  "tourism" |
  "townhall" |
  "train" |
  "-airport" |
  "-bus" |
  "-city" |
  "-country" |
  "-street" |
  "-tourism" |
  "-townhall" |
  "-train";

export type PKOptions = Partial<{
  timeout?: number;
  maxResults?: number;
  language?: string;
  types?: PKType[];
  countries?: string[];
  countryByIP?: boolean;
  forwardIP?: string;
  coordinates?: string;
}>;

export type PKPatchSearchOptions = Partial<{
  maxResults?: number;
  language?: string;
  countries?: string[];
  status?: PKPatchStatus;
}>;

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
  type: string;
  zipcode: string[];
  population: number;
  highlight: string;
};

type PKPatchStatus = 'pending' | 'approved';

export type PKPatchResult = PKResult & {
  id: string;
  status: PKPatchStatus;
};

export type PKPatchUpdate = {
  type: "airport" | "bus" | "city" | "street" | "tourism" | "townhall" | "train";
  name: string;
  city: string;
  county: string;
  administrative: string;
  country: string;
  countrycode: string;
  coordinates: string; // "lat,lng"
  zipcode: string[];
  population?: number;
};

export type PKSearchResponse = {
  results: PKResult[];
  resultsCount: number;
  maxResults: number;
  query: string;
};

export type PKPatchSearchResponse = {
  results: PKPatchResult[];
  resultsCount: number;
  maxResults: number;
  offset: number;
  totalResults: number;
};