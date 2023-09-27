export default PlaceKit;
export as namespace PlaceKit;

declare function PlaceKit(apiKey?: string, opts?: PKOptions): PKClient;

type AtLeastOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];

export interface PKClient {
  search(query: string, opts?: PKOptions): Promise<PKSearchResponse>;
  reverse(opts?: PKOptions): Promise<PKSearchResponse>;
  readonly options: PKOptions;
  configure(opts?: PKOptions): void;
  readonly hasGeolocation: boolean;
  requestGeolocation(opts?: Object): Promise<GeolocationPosition>;
  clearGeolocation(): void;
  patch: {
    list(opts?: PKPatchListOptions): Promise<PKPatchListResponse>;
    create(
      update: PKPatchUpdate,
      opts?: PKPatchUpdateOptions
    ): Promise<PKPatchResult>;
    create(
      update: AtLeastOne<PKPatchUpdate>,
      opts?: PKPatchUpdateOptions,
      origin: PKResult,
    ): Promise<PKPatchResult>;
    get(id: string, language?: string): Promise<PKPatchResult>;
    update(
      id: string,
      update?: AtLeastOne<PKPatchUpdate>,
      opts?: PKPatchUpdateOptions
    ): Promise<PKPatchResult>;
    delete(id: string): Promise<void>;
    deleteLang(id: string, language: string): Promise<void>;
  };
  keys: {
    list(): Promise<PKKeysResult[]>;
    create(
      role: "public" | "private",
      opts?: PKKeysOptions,
    ): Promise<PKKeysResult>;
    get(id: string): Promise<PKKeysResult>;
    update(
      id: string,
      opts?: PKKeysOptions
    ): Promise<PKKeysResult>;
    delete(id: string): Promise<void>;
  };
}

type PKType = "airport" | "bus" | "city" | "country" | "street" | "tourism" | "townhall" | "train";
type PKTypeFilter = PKType | "-airport" | "-bus" | "-city" | "-country" | "-street" | "-tourism" | "-townhall" | "-train";
type PKPatchType = Exclude<PKType, "country">;
type PKPatchTypeFilter = Exclude<PKTypeFilter, "country" | "-country">;
type PKPatchStatus = 'pending' | 'approved';

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

export type PKPatchResult = Omit<PKResult, "type"> & {
  id: string;
  status: PKPatchStatus;
  type: PKPatchType;
};

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
  population: number;
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
  types?: PKPatchTypeFilter[];
  status?: PKPatchStatus;
};

export type PKPatchListResponse = {
  results: PKPatchResult[];
  resultsCount: number;
  maxResults: number;
  offset: number;
  totalResults: number;
};

export type PKKeysResult = {
  id: string;
  token: string;
  appId: string;
  role: "public" | "private";
  domains: string[];
  createdAt: string;
  updatedAt: string;
}

export type PKKeysOptions = {
  domains?: string[];
};