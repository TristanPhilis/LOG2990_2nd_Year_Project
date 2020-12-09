import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { SearchHelper } from './search-helper';

describe('SearchHelper', () => {
    let canvasSize: Vec2;
    beforeEach(() => {
        const size = 100;
        canvasSize = { x: size, y: size };
    });

    it('should create an instance', () => {
        expect(new SearchHelper()).toBeTruthy();
    });

    it('getColorFromIndex should return the right color', () => {
        // tslint:disable-next-line:no-magic-numbers
        const pixelsData = new Uint8ClampedArray([25, 120, 60, 255]);
        // tslint:disable-next-line:no-magic-numbers
        const color = new Color(25, 120, 60);

        const result: Color = SearchHelper.getColorFromIndex(0, pixelsData);
        expect(result).toEqual(color);
    });

    it('getColorFromCoord should return the right color', () => {
        // tslint:disable-next-line:no-magic-numbers
        const pixelsData = new Uint8ClampedArray([25, 120, 60, 255]);
        // tslint:disable-next-line:no-magic-numbers
        const color = new Color(25, 120, 60);
        const coord = { x: 0, y: 0 };

        const result: Color = SearchHelper.getColorFromCoord(coord, canvasSize, pixelsData);
        expect(result).toEqual(color);
    });

    it('getIndexFromCoord should do the right conversion', () => {
        const coord: Vec2 = { x: 1, y: 2 };
        const expectedIndex = 804;
        const result = SearchHelper.getIndexFromCoord(coord, canvasSize);
        expect(result).toEqual(expectedIndex);
    });

    it('getCoordFromIndex should do the right conversion', () => {
        const expectedCoord: Vec2 = { x: 1, y: 2 };
        const index = 804;
        const result = SearchHelper.getCoordFromIndex(index, canvasSize);
        expect(result).toEqual(expectedCoord);
    });

    it('wasCoordVisited should return the right value', () => {
        const coord: Vec2 = { x: 1, y: 2 };
        const index = 804;
        const visitedPixel: boolean[] = new Array();
        visitedPixel[index] = true;
        const result = SearchHelper.wasCoordVisited(coord, canvasSize, visitedPixel);
        expect(result).toBeTrue();
    });

    it('getAdjacentCoords should return an array of the 8 surrending coords', () => {
        const coord = { x: 1, y: 1 };
        const result = SearchHelper.getAdjacentCoords(coord);
        const expectedLenght = 8;
        expect(result.length).toEqual(expectedLenght);
    });
});
