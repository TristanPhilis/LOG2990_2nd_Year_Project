import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undoredo-service';
import { TraceTypes } from '@app/shared/enum';
import { Color } from './color';
import { DrawingAction } from './drawing-action';
import { DrawingOptions } from './drawing-options';
import { Vec2 } from './vec2';

// This is justified since we have functions that will be managed by the child classes.
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    shiftDown: boolean = false;
    dblClick: boolean = false;
    options: DrawingOptions;

    constructor(protected drawingService: DrawingService, protected undoRedoService: UndoRedoService, private colorService: ColorSelectionService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseClick(event: MouseEvent): void {}

    onMouseDoubleClick(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    draw(ctx: CanvasRenderingContext2D, action: DrawingAction): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    getDiff(firstCoord: Vec2, secondCoord: Vec2): Vec2 {
        const xDiff = secondCoord.x - firstCoord.x;
        const yDiff = secondCoord.y - firstCoord.y;
        return { x: xDiff, y: yDiff };
    }

    fill(ctx: CanvasRenderingContext2D, traceType: TraceTypes, primaryColor: Color, secondaryColor: Color): void {
        ctx.fillStyle = primaryColor.getRgbString();
        ctx.strokeStyle = secondaryColor.getRgbString();
        switch (traceType) {
            case TraceTypes.fill: {
                ctx.fill();
                break;
            }
            case TraceTypes.stroke: {
                ctx.stroke();
                break;
            }
            case TraceTypes.fillAndStroke: {
                ctx.fill();
                ctx.stroke();
                break;
            }
        }
    }

    abstract getDrawingAction(): DrawingAction;

    setDefaultOptions(): void {}

    get primaryColor(): Color {
        return this.colorService.primaryColor;
    }

    get secondaryColor(): Color {
        return this.colorService.secondaryColor;
    }
}
