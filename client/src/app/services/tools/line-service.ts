import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BACKSPACE_KEY, BASE_SNAP_ANGLE, DEFAULT_OPTIONS, ESCAPE_KEY, MIDDLE_SNAP_ANGLE, SHIFT_KEY } from '@app/shared/constant';
import { drawingToolId } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    lineStarted: boolean;
    currentCoord: Vec2;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.clearPath();
        this.setDefaultOptions();
        this.lineStarted = false;
    }
    setDefaultOptions(): void {
        this.options = {
            primaryColor: this.primaryColor,
            size: DEFAULT_OPTIONS.size,
        };
    }

    private getLastClickedCoord(): Vec2 {
        const length = this.pathData.length;
        return length > 1 ? this.pathData[length - 2] : { x: 0, y: 0 };
    }

    onMouseClick(event: MouseEvent): void {
        if (this.lineStarted) {
            this.pathData.push(this.pathData[this.pathData.length - 1]);
        } else {
            this.lineStarted = true;
            const initialCoord = this.getPositionFromMouse(event);
            this.currentCoord = initialCoord;
            this.pathData = [initialCoord, initialCoord];
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.lineStarted) {
            this.currentCoord = this.getPositionFromMouse(event);
            this.updateLastCoord();
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
    }

    onMouseDoubleClick(event: MouseEvent): void {
        if (this.lineStarted) {
            this.endLine();
            const drawingAction = this.getDrawingAction();
            this.undoRedoService.saveAction(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
            this.lineStarted = false;
            this.clearPath();
        }
    }

    endLine(): void {
        const closingMinDistance = 20;
        const endPoint = this.getLastClickedCoord();
        const initialPoint = this.pathData[0];
        const diff = this.getDiff(initialPoint, endPoint);
        const closeShape = Math.abs(diff.x) <= closingMinDistance && Math.abs(diff.y) <= closingMinDistance;
        if (closeShape) {
            this.pathData.splice(this.pathData.length - 1, 1, initialPoint);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.lineStarted) {
                this.updateLastCoord();
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
                        this.updateLastCoord();
                        this.draw(this.drawingService.previewCtx, this.getDrawingAction());
                    }
                }
                break;
            case BACKSPACE_KEY:
                this.pathData.splice(this.pathData.length - 2, 1);
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

    updateLastCoord(): void {
        const lastClickedCoord = this.getLastClickedCoord();
        const adjustedCoord = this.getAdjustedCoord(lastClickedCoord, this.currentCoord);
        this.pathData.splice(this.pathData.length - 1, 1, adjustedCoord);
    }

    calculateAngle(startingPoint: Vec2, endPoint: Vec2): number {
        const diff = this.getDiff(startingPoint, endPoint);
        return Math.atan(Math.abs(diff.y) / Math.abs(diff.x));
    }

    getAdjustedCoord(initialPoint: Vec2, finalPoint: Vec2): Vec2 {
        return this.shiftDown ? this.getSnappedCoord(initialPoint, finalPoint) : finalPoint;
    }

    getSnappedCoord(initialPoint: Vec2, finalPoint: Vec2): Vec2 {
        const angle = this.calculateAngle(initialPoint, finalPoint);

        let point = { x: 0, y: 0 };
        if (angle < BASE_SNAP_ANGLE) {
            point = { x: finalPoint.x, y: initialPoint.y };
        } else if (angle > MIDDLE_SNAP_ANGLE + BASE_SNAP_ANGLE) {
            point = { x: initialPoint.x, y: finalPoint.y };
        } else {
            point = this.getProjectedPoint(initialPoint, finalPoint);
        }
        return point;
    }

    getProjectedPoint(initialPoint: Vec2, finalPoint: Vec2): Vec2 {
        const diff = this.getDiff(initialPoint, finalPoint);

        const projectedPoint = {
            x: finalPoint.x,
            y: initialPoint.y + Math.tan(MIDDLE_SNAP_ANGLE) * Math.abs(diff.x) * Math.sign(diff.y),
        };
        return projectedPoint;
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        if (drawingAction.path && drawingAction.options.size) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineWidth = drawingAction.options.size;
            ctx.strokeStyle = drawingAction.options.primaryColor.getRgbString();

            const startingPoint = drawingAction.path[0];
            ctx.moveTo(startingPoint.x, startingPoint.y);
            for (const point of drawingAction.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.closePath();
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
    }
}
