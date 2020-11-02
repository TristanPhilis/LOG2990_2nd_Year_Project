import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undoRedo-service';
import { BACKSPACE_KEY, BASE_SNAP_ANGLE, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';
import { drawingToolId } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    lineStarted: boolean;
    currentCoord: Vec2;
    initialCoord: Vec2;
    private thickness: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.thickness = 0;
        this.clearPath();
        this.lineStarted = false;
    }

    set _thickness(newThickness: number) {
        this.thickness = newThickness;
    }

    get _thickness(): number {
        return this.thickness;
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
            this.draw(this.drawingService.previewCtx, this.pathData);
            this.pathData.pop();
        }
    }

    onMouseDoubleClick(undoRedo: UndoRedoService): void {
        if (this.lineStarted) {
            undoRedo.undoPile.push({ path: this.pathData, id: drawingToolId.lineService, thickness: this._thickness, traceType: 0 });
            // const onMouseclickTriggerAdjustment = 2;
            // this.pathData.splice(this.pathData.length - onMouseclickTriggerAdjustment, onMouseclickTriggerAdjustment);
            this.draw(this.drawingService.baseCtx, this.pathData);
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
                this.draw(this.drawingService.previewCtx, this.pathData);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case SHIFT_KEY:
                if (this.shiftDown !== true) {
                    this.shiftDown = true;
                    if (this.lineStarted) {
                        this.draw(this.drawingService.previewCtx, this.pathData);
                    }
                }
                break;
            case BACKSPACE_KEY:
                this.pathData.pop();
                if (this.lineStarted) {
                    this.draw(this.drawingService.previewCtx, this.pathData);
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

    draw(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const adjustedCoord = this.getAdjustedCoord(path);
        ctx.beginPath();
        ctx.lineTo(path[0].x, path[0].y);
        ctx.lineWidth = this.thickness;
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }

        ctx.lineTo(adjustedCoord.x, adjustedCoord.y);
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
        this.initialCoord = { x: 0, y: 0 };
        this.currentCoord = { x: 0, y: 0 };
    }
}
