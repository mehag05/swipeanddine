export interface Location {
    latitude: number;
    longitude: number;
}

export interface Restaurant {
    id: string;
    name: string;
    rating?: number;
    priceLevel?: number;
    types: string[];
    photoUrl: string | null;
    vicinity: string;
    location: Location;
}

export interface RestaurantResponse {
    results: any[];
    status: string;
}