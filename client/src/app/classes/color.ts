export const R_MASK = 0xff0000;
export const G_MASK = 0x00ff00;
export const B_MASK = 0x0000ff;
export const BYTE = 8;
export const MAX_ALPHA = 1;
export const MAX_RBG_VALUE = 255;
export const MAX_HEX_VALUE = 0xffffff;
const HEX_CHARACTER_COUNT = 6;

export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    hex: number;

    constructor(r: number, g: number, b: number, a?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a ? a : MAX_ALPHA;
        // disable tlsint to combine the rgb values into a single hex value.
        // tslint:disable-next-line:no-bitwise
        this.hex = (r << (2 * BYTE)) | (g << BYTE) | b;
    }

    getRgbString(): string {
        return `rgb(${this.r},${this.g},${this.b},${this.a})`;
    }

    get hexString(): string {
        let hexString = this.hex.toString(16);
        while (hexString.length < HEX_CHARACTER_COUNT) {
            hexString = '0' + hexString;
        }
        return hexString;
    }

    get stripedHexString(): string {
        return this.hex.toString(16);
    }
    // disable tlsint to split a single hex value into the representing r g b values.
    // tslint:disable:no-bitwise
    setHex(hex: number): void {
        this.r = (hex & R_MASK) >> (2 * BYTE);
        this.g = (hex & G_MASK) >> BYTE;
        this.b = hex & B_MASK;
        this.hex = hex;
    }
    // tslint:enable:no-bitwise
}
