import { Color, MAX_ALPHA } from './color-service';

describe('Color', () => {
    let color: Color;
    const r = 6;
    const g = 50;
    const b = 255;
    const a = 0.5;
    const hex = 0x0632ff;
    beforeEach(() => {
        color = new Color(r, g, b, a);
    });

    it('should create an instance', () => {
        expect(color).toBeTruthy();
    });

    it('should create with right values', () => {
        expect(color.r).toEqual(r);
        expect(color.g).toEqual(g);
        expect(color.b).toEqual(b);
        expect(color.a).toEqual(a);
        expect(color.hex).toEqual(hex);
    });

    it('should default to max alpha', () => {
        const newColor = new Color(0, 0, 0);
        expect(newColor.a).toEqual(MAX_ALPHA);
    });

    it('should return correct rgb string', () => {
        const rgbString = 'rgb(6,50,255,0.5)';
        expect(color.getRgbString()).toEqual(rgbString);
    });

    it('should return correct hex string', () => {
        const hexString = '0632ff';
        const stripedHexString = '632ff';
        expect(color.hexString).toEqual(hexString);
        expect(color.stripedHexString).toEqual(stripedHexString);
    });

    it('changing hex value should change rgb values', () => {
        const newColor = new Color(0, 0, 0);
        newColor.setHex(hex);
        expect(color.r).toEqual(r);
        expect(color.g).toEqual(g);
        expect(color.b).toEqual(b);
        expect(color.hex).toEqual(hex);
    });
});
