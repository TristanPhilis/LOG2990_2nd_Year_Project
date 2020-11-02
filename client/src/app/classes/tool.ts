import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undoRedo-service';
import { Vec2 } from './vec2';

// This is justified since we have functions that will be managed by the child classes.
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    shiftDown: boolean = false;
    dblClick: boolean = false;

    constructor(protected drawingService: DrawingService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent, undoRedo: UndoRedoService): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseClick(event: MouseEvent): void {}

    onMouseDoubleClick(undoRedo: UndoRedoService): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    draw(ctx: CanvasRenderingContext2D, path: Vec2[]): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    getDiff(firstCoord: Vec2, secondCoord: Vec2): Vec2 {
        const xDiff = secondCoord.x - firstCoord.x;
        const yDiff = secondCoord.y - firstCoord.y;
        return { x: xDiff, y: yDiff };
    }
}
