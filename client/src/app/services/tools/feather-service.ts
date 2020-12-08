import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {
    ANGLE_ROTATION,
    ANGLE_ROTATION_BASE,
    ANGLE_ROTATION_ONE,
    DEFAULT_OPTIONS,
    DEG_TO_RAD_FACTOR,
    ROTATION_COMPLETE,
    ROTATION_HALF,
} from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

export const MINIMUM_FEATHER_SIZE = 50;
@Injectable({
    providedIn: 'root',
})
export class FeatherService extends Tool {
    private pathData: Vec2[];
    mousePosition: Vec2;
    coord: Vec2[] = [];
    constructor(drawingService: DrawingService, colorService: ColorSelectionService) {
        super(drawingService, colorService);
        this.clearPath();
        this.setDefaultOptions();
    }

    get lastAddedPoint(): Vec2 {
        return this.pathData[this.pathData.length - 2];
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.size, { value: MINIMUM_FEATHER_SIZE, displayName: 'Largeur' }],
            [Options.angle, { value: DEFAULT_OPTIONS.angle, displayName: 'Angle' }],
        ]);

        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (!this.mouseDown) {
            return;
        }
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.addPointToPath(this.mouseDownCoord);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
        this.action.next(this.getDrawingAction());
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        const coordsToAdd = this.getCoordsToAdd(this.lastAddedPoint, this.mouseDownCoord);
        coordsToAdd.forEach((coord: Vec2) => {
            this.addPointToPath(coord);
        });
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const path = drawingAction.path;
        const size = drawingAction.options.toolOptions.get(Options.size);
        const angle = drawingAction.options.toolOptions.get(Options.angle);

        if (path && size && angle) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = drawingAction.options.primaryColor.getRgbString();
            ctx.lineJoin = ctx.lineCap = 'round';
            for (let i = 0; i < path.length; i += 2) {
                ctx.moveTo(path[i].x, path[i].y);
                ctx.lineTo(path[i + 1].x, path[i + 1].y);
            }
            ctx.stroke();
        }
    }

    onWheel(event: WheelEvent): void {
        const changeAngle = event.altKey ? 1 : ANGLE_ROTATION;
        const angle = this.options.toolOptions.get(Options.angle);
        if (angle) {
            let newAngle = angle.value + Math.sign(event.deltaY) * changeAngle;
            if (newAngle < 0) {
                newAngle += ROTATION_COMPLETE;
            } else if (newAngle > ROTATION_COMPLETE) {
                newAngle -= ROTATION_COMPLETE;
            }
            angle.value = newAngle;
            this.options.toolOptions.set(Options.angle, angle);
            if (this.mouseDown) {
                this.fillFromRotation(angle.value, event);
            }
        }
    }
    fillFromRotation(changeAngle: number, event: WheelEvent): void {
        this.addPointToPath(this.lastAddedPoint);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());

        const ctx = this.drawingService.baseCtx;
        const angle = event.altKey ? ANGLE_ROTATION_ONE : ANGLE_ROTATION_BASE;
        const actualChangeAngle = (changeAngle * Math.PI) / ROTATION_HALF;
        const size = (this.options.toolOptions.get(Options.size) as ToolOption).value;
        ctx.fillStyle = this.getDrawingAction().options.primaryColor.getRgbString();

        ctx.beginPath();
        ctx.lineTo(this.lastAddedPoint.x, this.lastAddedPoint.y);
        ctx.arc(this.lastAddedPoint.x, this.lastAddedPoint.y, size, actualChangeAngle, angle, true);
        ctx.fill();
        ctx.stroke();
    }

    private getCoordsToAdd(lastPoint: Vec2, newPoint: Vec2): Vec2[] {
        const coordsToAdd: Vec2[] = [];
        const distance = Math.hypot(newPoint.x - lastPoint.x, newPoint.y - lastPoint.y);
        const diff = this.getDiff(lastPoint, newPoint);
        const angle = Math.atan(Math.abs(diff.y) / Math.abs(diff.x));
        for (let distanceFromLastPoint = 2; distanceFromLastPoint < distance; distanceFromLastPoint += 2) {
            const pointToAdd = {
                x: Math.round(lastPoint.x + Math.cos(angle) * distanceFromLastPoint * Math.sign(diff.x)),
                y: Math.round(lastPoint.y + Math.sin(angle) * distanceFromLastPoint * Math.sign(diff.y)),
            };
            coordsToAdd.push(pointToAdd);
        }
        coordsToAdd.push(newPoint);
        return coordsToAdd;
    }

    private addPointToPath(coord: Vec2): void {
        this.pathData.push(coord);
        this.pathData.push(this.calculateStrokeTipCoord(coord));
    }

    private calculateStrokeTipCoord(coord: Vec2): Vec2 {
        const angle = (this.options.toolOptions.get(Options.angle) as ToolOption).value;
        const size = (this.options.toolOptions.get(Options.size) as ToolOption).value;
        const strokeTipPoint = {
            x: coord.x + Math.cos(DEG_TO_RAD_FACTOR * angle) * size,
            y: coord.y + Math.sin(DEG_TO_RAD_FACTOR * angle) * size,
        };

        return strokeTipPoint;
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.featherService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
