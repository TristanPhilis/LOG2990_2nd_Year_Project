import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, BASE_SNAP_ANGLE, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    currentCoord: Vec2;
    lineStarted: boolean;
    initialCoord: Vec2;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
        this.lineStarted = false;
    }

    onMouseClick(event: MouseEvent): void {
        if (this.lineStarted) {
            this.pathData.push(this.currentCoord);
        } else {
            this.lineStarted = true;
            this.initialCoord = this.getPositionFromMouse(event);
            this.currentCoord = this.initialCoord;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.lineStarted) {
            this.currentCoord = this.getPositionFromMouse(event);
            if (this.shiftDown) {
                this.currentCoord = this.getSnappedCoord();
            }
            this.drawLine(this.drawingService.previewCtx);
        }
    }

    onMouseDoubleClick(event: MouseEvent): void {
        if (this.lineStarted) {
            this.drawLine(this.drawingService.baseCtx);
            this.endLine();
        }
    }

    endLine(): void {
        const closingMinDistance = 20;
        const diff = this.getDiff(this.initialCoord, this.currentCoord);
        const closeShape = Math.abs(diff.x) <= closingMinDistance && Math.abs(diff.y) <= closingMinDistance;
        if (closeShape) {
            const ctx = this.drawingService.baseCtx;
            ctx.beginPath();
            ctx.moveTo(this.currentCoord.x, this.currentCoord.y);
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
                this.shiftDown = true;
                if (this.lineStarted) {
                    this.drawLine(this.drawingService.previewCtx);
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
            point = this.getProjectedPoint(startingPoint, this.currentCoord, angle);
        }
        return point;
    }

    getProjectedPoint(startingPoint: Vec2, endPoint: Vec2, angle: number): Vec2 {
        const diff = this.getDiff(startingPoint, this.currentCoord);
        // parameter angle is the angle between the line based on the two points and the positive x axis
        // middle angle is between the line and the 45 degree line from the positive x axis
        const middleAngle = MIDDLE_SNAP_ANGLE - angle;
        const currentLineLenght = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
        const projectedLineLenght = currentLineLenght * Math.cos(middleAngle);
        const projectedPoint = {
            x: startingPoint.x + Math.cos(MIDDLE_SNAP_ANGLE) * projectedLineLenght * Math.sign(diff.x),
            y: startingPoint.y + Math.sin(MIDDLE_SNAP_ANGLE) * projectedLineLenght * Math.sign(diff.y),
        };
        return projectedPoint;
    }

    private drawLine(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();

        ctx.moveTo(this.initialCoord.x, this.initialCoord.y);
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }

        ctx.lineTo(this.currentCoord.x, this.currentCoord.y);
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
        this.initialCoord = { x: 0, y: 0 };
        this.currentCoord = { x: 0, y: 0 };
    }
}
