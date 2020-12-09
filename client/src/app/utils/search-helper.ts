import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { A_POSITION, B_POSITION, G_POSITION, PIXEL_INTERVAL, R_POSITION } from '@app/shared/constant';

export class SearchHelper {
    static getIndexFromCoord(coord: Vec2, canvasSize: Vec2): number {
        return (coord.x + canvasSize.x * coord.y) * PIXEL_INTERVAL;
    }

    static getCoordFromIndex(colorIndex: number, canvasSize: Vec2): Vec2 {
        const y = Math.floor(colorIndex / PIXEL_INTERVAL / canvasSize.x);
        const x = colorIndex / PIXEL_INTERVAL - canvasSize.x * y;
        return { x, y };
    }

    static getColorFromIndex(colorIndex: number, pixelsData: Uint8ClampedArray): Color {
        return new Color(
            pixelsData[colorIndex + R_POSITION],
            pixelsData[colorIndex + G_POSITION],
            pixelsData[colorIndex + B_POSITION],
            pixelsData[colorIndex + A_POSITION] / MAX_RGBA_VALUE,
        );
    }

    static getColorFromCoord(coord: Vec2, canvasSize: Vec2, pixelsData: Uint8ClampedArray): Color {
        const colorIndex = SearchHelper.getIndexFromCoord(coord, canvasSize);
        return SearchHelper.getColorFromIndex(colorIndex, pixelsData);
    }

    static wasCoordVisited(coord: Vec2, canvasSize: Vec2, visitedPixels: boolean[]): boolean {
        const pixelIndex = SearchHelper.getIndexFromCoord(coord, canvasSize);
        return visitedPixels[pixelIndex];
    }

    static getAdjacentCoords(coord: Vec2): Vec2[] {
        return [
            { x: coord.x, y: coord.y + 1 },
            { x: coord.x + 1, y: coord.y + 1 },
            { x: coord.x + 1, y: coord.y },
            { x: coord.x + 1, y: coord.y - 1 },
            { x: coord.x, y: coord.y - 1 },
            { x: coord.x - 1, y: coord.y - 1 },
            { x: coord.x - 1, y: coord.y },
            { x: coord.x - 1, y: coord.y + 1 },
        ];
    }
}
