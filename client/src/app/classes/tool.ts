import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorSelection, drawingToolId, JointSelection, SelectionType, Texture, TraceTypes } from '@app/shared/enum';
import { Vec2 } from './vec2';

// This is justified since we have functions that will be managed by the child classes.
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    shiftDown: boolean = false;
    dblClick: boolean = false;

    // Tool identification
    id: drawingToolId;
    name: string;
    // All tool options
    colorSelection?: ColorSelection = ColorSelection.primary;
    color?: string;
    lineJoint?: JointSelection;
    size?: number;
    outlineType?: string;
    traceType?: TraceTypes;
    texture?: Texture;
    toleranceInterval?: number;
    numberOfSides?: number;
    selctionType?: SelectionType;
    angle?: number;
    lineLength?: number;
    emissionPerSecond?: number;
    imageChoice?: string;

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
