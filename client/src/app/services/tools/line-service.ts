import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undoRedo-service';
import { BACKSPACE_KEY, BASE_SNAP_ANGLE, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';

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
            const adjustedCoord = this.getAdjustedCoord();
            this.pathData.push(adjustedCoord);
        } else {
            this.lineStarted = true;
            this.initialCoord = this.getPositionFromMouse(event);
            this.currentCoord = this.initialCoord;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.lineStarted) {
            this.currentCoord = this.getPositionFromMouse(event);
            this.drawLine(this.drawingService.previewCtx);
        }
    }

    onMouseDoubleClick(undoRedo: UndoRedoService): void {
        undoRedo.undoPile.push({ path: this.pathData, id: 'line' });
        if (this.lineStarted) {
            // const onMouseclickTriggerAdjustment = 2;
            // this.pathData.splice(this.pathData.length - onMouseclickTriggerAdjustment, onMouseclickTriggerAdjustment);
            this.drawLine(this.drawingService.baseCtx);
            this.endLine();
        }
    }

    endLine(): void {
        const closingMinDistance = 20;
        const endCoord = this.getAdjustedCoord();
        const diff = this.getDiff(this.initialCoord, this.currentCoord);
        const closeShape = Math.abs(diff.x) <= closingMinDistance && Math.abs(diff.y) <= closingMinDistance;
        if (closeShape) {
            const ctx = this.drawingService.baseCtx;
            ctx.beginPath();
            ctx.moveTo(endCoord.x, endCoord.y);
            ctx.lineTo(this.initialCoord.x, this.initialCoord.y);
            ctx.stroke();
        }
        this.clearPath();
        this.lineStarted = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.lineStarted) {
                this.drawLine(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case SHIFT_KEY:
                if (this.shiftDown !== true) {
                    this.shiftDown = true;
                    if (this.lineStarted) {
                        this.drawLine(this.drawingService.previewCtx);
                    }
                }
                break;
            case BACKSPACE_KEY:
                this.pathData.pop();
                if (this.lineStarted) {
                    this.drawLine(this.drawingService.previewCtx);
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

    getAdjustedCoord(): Vec2 {
        return this.shiftDown ? this.getSnappedCoord() : this.currentCoord;
    }

    getSnappedCoord(): Vec2 {
        const nPoints = this.pathData.length;
        const startingPoint = nPoints > 0 ? this.pathData[nPoints - 1] : this.initialCoord;
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

    private drawLine(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const adjustedCoord = this.getAdjustedCoord();
        ctx.beginPath();

        ctx.moveTo(this.initialCoord.x, this.initialCoord.y);
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
