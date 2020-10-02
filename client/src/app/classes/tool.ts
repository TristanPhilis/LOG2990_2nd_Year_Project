import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    shiftDown: boolean = false;

    constructor(protected drawingService: DrawingService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseClick(event: MouseEvent): void {}

    onMouseDoubleClick(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    getDiff(firstCoord: Vec2, secondCoord: Vec2): Vec2 {
        const xDiff = secondCoord.x - firstCoord.x;
        const yDiff = secondCoord.y - firstCoord.y;
        return { x: xDiff, y: yDiff };
    }
}
