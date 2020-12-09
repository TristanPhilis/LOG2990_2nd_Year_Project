import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { Options, TraceTypes } from '@app/shared/enum';
import { Subject } from 'rxjs';
import { Color } from './color';
import { DrawingAction } from './drawing-action';
import { DrawingOptions } from './drawing-options';
import { SelectionAction } from './selection-action';
import { ToolOption } from './tool-option';
import { Vec2 } from './vec2';

// This is justified since we have functions that will be managed by the child classes.
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean;
    shiftDown: boolean;
    dblClick: boolean;
    options: DrawingOptions;
    action: Subject<DrawingAction | SelectionAction>;
    onActionStateChange: Subject<boolean>;

    constructor(protected drawingService: DrawingService, protected colorService: ColorSelectionService, private shortCutService: ShortcutService) {
        this.action = new Subject<DrawingAction>();
        this.mouseDown = false;
        this.shiftDown = false;
        this.dblClick = false;
    }

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseClick(event: MouseEvent): void {}

    onMouseDoubleClick(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    onWheel(event: WheelEvent): void {}

    draw(ctx: CanvasRenderingContext2D, action: DrawingAction | SelectionAction): void {}

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

    copyToolOptionMap(map: Map<Options, ToolOption>): Map<Options, ToolOption> {
        const mapCopy = new Map<Options, ToolOption>();
        for (const option of map) {
            mapCopy.set(option[0], { value: option[1].value, displayName: option[1].displayName });
        }
        return mapCopy;
    }

    setDefaultOptions(): void {}

    onOptionValueChange(): void {}

    onActionStart(): void {
        this.shortCutService.shortcutsEnabled = false;
    }

    onActionFinish(): void {
        this.shortCutService.shortcutsEnabled = true;
    }

    get primaryColor(): Color {
        return this.colorService.primaryColor;
    }

    get secondaryColor(): Color {
        return this.colorService.secondaryColor;
    }
}
