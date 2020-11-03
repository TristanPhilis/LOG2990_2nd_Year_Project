import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, BASE_SNAP_ANGLE, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';
import { drawingToolId } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    lineStarted: boolean;
    currentCoord: Vec2;
    initialCoord: Vec2;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.clearPath();
        this.setDefaultOptions();
        this.lineStarted = false;
    }
    setDefaultOptions(): void {
        this.options = {
            primaryColor: this.primaryColor,
            size: 1,
        };
    }
    set _thickness(newThickness: number) {
        this.options.size = newThickness;
    }

    get _thickness(): number {
        return this.options.size ? this.options.size : 1;
    }

    onMouseClick(event: MouseEvent): void {
        if (this.lineStarted) {
            const adjustedCoord = this.getAdjustedCoord(this.pathData);
            this.pathData.push(adjustedCoord);
        } else {
            this.lineStarted = true;
            this.initialCoord = this.getPositionFromMouse(event);
            this.currentCoord = this.initialCoord;
            this.pathData.push(this.currentCoord);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.lineStarted) {
            this.currentCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.currentCoord);
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            this.pathData.pop();
        }
    }

    onMouseDoubleClick(event: MouseEvent): void {
        if (this.lineStarted) {
            this.undoRedoService.saveAction(this.getDrawingAction());
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
            this.endLine(this.pathData);
        }
    }

    endLine(path: Vec2[]): void {
        const closingMinDistance = 20;
        const endCoord = this.getAdjustedCoord(path);
        const diff = this.getDiff(path[0], path[path.length - 1]);
        const closeShape = Math.abs(diff.x) <= closingMinDistance && Math.abs(diff.y) <= closingMinDistance;
        if (closeShape) {
            const ctx = this.drawingService.baseCtx;
            ctx.beginPath();
            ctx.moveTo(endCoord.x, endCoord.y);
            ctx.lineTo(path[0].x, path[0].y);
            ctx.stroke();
        }
        this.clearPath();
        this.lineStarted = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.lineStarted) {
                this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case SHIFT_KEY:
                if (this.shiftDown !== true) {
                    this.shiftDown = true;
                    if (this.lineStarted) {
                        this.draw(this.drawingService.previewCtx, this.getDrawingAction());
                    }
                }
                break;
            case BACKSPACE_KEY:
                this.pathData.pop();
                if (this.lineStarted) {
                    this.draw(this.drawingService.previewCtx, this.getDrawingAction());
                }
                break;
            case ESCAPE_KEY:
                this.lineStarted = false;
                this.clearPath();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                break;
        }
    }

    calculateAngle(startingPoint: Vec2, endPoint: Vec2): number {
        const diff = this.getDiff(startingPoint, endPoint);
        return Math.atan(Math.abs(diff.y) / Math.abs(diff.x));
    }

    getAdjustedCoord(path: Vec2[]): Vec2 {
        return this.shiftDown ? this.getSnappedCoord(path) : this.currentCoord;
    }

    getSnappedCoord(path: Vec2[]): Vec2 {
        const nPoints = path.length;
        const startingPoint = nPoints > 0 ? path[nPoints - 1] : path[0];
        const angle = this.calculateAngle(startingPoint, this.currentCoord);

        let point = { x: 0, y: 0 };
        if (angle < BASE_SNAP_ANGLE) {
            point = { x: this.currentCoord.x, y: startingPoint.y };
        } else if (angle > MIDDLE_SNAP_ANGLE + BASE_SNAP_ANGLE) {
            point = { x: startingPoint.x, y: this.currentCoord.y };
        } else {
            point = this.getProjectedPoint(startingPoint);
        }
        return point;
    }

    getProjectedPoint(startingPoint: Vec2): Vec2 {
        const diff = this.getDiff(startingPoint, this.currentCoord);

        const projectedPoint = {
            x: this.currentCoord.x,
            y: startingPoint.y + Math.tan(MIDDLE_SNAP_ANGLE) * Math.abs(diff.x) * Math.sign(diff.y),
        };
        return projectedPoint;
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        if (drawingAction.path && drawingAction.options.size) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const adjustedCoord = this.getAdjustedCoord(drawingAction.path);
            ctx.beginPath();
            ctx.lineWidth = drawingAction.options.size;
            ctx.strokeStyle = this.options.primaryColor.getRgbString();
            ctx.lineTo(drawingAction.path[0].x, drawingAction.path[0].y);
            for (const point of this.pathData) {
                ctx.lineTo(point.x, point.y);
            }

            ctx.lineTo(adjustedCoord.x, adjustedCoord.y);
            ctx.stroke();
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            size: this.options.size,
        };
        return {
            id: drawingToolId.lineService,
            path: this.pathData,
            options,
        };
    }
    private clearPath(): void {
        this.pathData = [];
        this.initialCoord = { x: 0, y: 0 };
        this.currentCoord = { x: 0, y: 0 };
    }
}
