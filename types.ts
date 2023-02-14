export interface Printable {
    territory: {
        name: string,
        number: string
    },
    addressesWithLocation: {address: string, latitude: number, longitude: number, markerColor: string}[],
    addressesWithoutLocation: string[],
    map: string | undefined
}