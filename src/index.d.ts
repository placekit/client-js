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
    list(opts?: PKPatchListOptions): PKPatchListResponse;
    create(
      update: PKPatchUpdate,
      opts?: PKPatchUpdateOptions
    ): PKPatchResult;
    create(
      update: Partial<PKPatchUpdate>,
      origin: PKResult,
      opts?: PKPatchUpdateOptions
    ): PKPatchResult;
    get(id: string): PKPatchResult;
    update(
      id: string,
      update: Partial<PKPatchUpdate>,
      opts?: PKPatchUpdateOptions
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

export type PKOptions = {
  timeout?: number;
  maxResults?: number;
  language?: string;
  types?: PKType[];
  countries?: string[];
  countryByIP?: boolean;
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
  type: string;
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

type PKPatchStatus = 'pending' | 'approved';

export type PKPatchResult = PKResult & {
  id: string;
  status: PKPatchStatus;
};

type PKPatchType = "airport" | "bus" | "city" | "street" | "tourism" | "townhall" | "train";

export type PKPatchUpdate = {
  type: PKPatchType;
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

type PKPatchUpdateOptions = {
  status?: PKPatchStatus;
  language?: string;
};

export type PKPatchListOptions = {
  query?: string;
  maxResults?: number;
  language?: string;
  countries?: string[];
  types?: Exclude<PKType, "country" | "-country">[];
  status?: PKPatchStatus;
};

export type PKPatchListResponse = {
  results: PKPatchResult[];
  resultsCount: number;
  maxResults: number;
  offset: number;
  totalResults: number;
};