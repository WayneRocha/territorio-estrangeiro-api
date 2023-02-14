import { GeoPoint } from "firebase/firestore"

export interface FB_Address {
    id: string,
    number: string,
    address: string,
    riskyLocal: boolean,
    note: string,
    district: string,
    geolocation: GeoPoint | null,
    geocode: string | null,
    territory: string | null
}

export interface Coordinates {
    latitude: number,
    longitude: number
}

export interface Address {
    id: string,
    number: string,
    address: string,
    riskyLocal: boolean,
    note: string,
    district: string,
    geolocation: GeoPoint & Coordinates | null,
    geocode: string | null,
    territory: string | null
}