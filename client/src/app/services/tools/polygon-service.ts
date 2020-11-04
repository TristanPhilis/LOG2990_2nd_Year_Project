import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Box } from '@app/classes/box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, DEFAULT_OPTIONS } from '@app/shared/constant';
import { drawingToolId, MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

export const MAX_SIDES = 12;
export const MIN_SIDES = 3;

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    selectionBox: SelectionBox;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.setDefaultOptions();
        this.selectionBox = new SelectionBox();
    }

    setDefaultOptions(): void {
        this.options = {
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            size: DEFAULT_OPTIONS.size,
            traceType: DEFAULT_OPTIONS.traceType,
            numberOfSides: MIN_SIDES,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.selectionBox.setAnchor(currentCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.selectionBox.updateOpposingCorner(this.getPositionFromMouse(event));
            const action = this.getDrawingAction();
            this.undoRedoService.saveAction(action);
            this.draw(this.drawingService.baseCtx, action);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.selectionBox.updateOpposingCorner(this.getPositionFromMouse(event));
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            this.drawSelectionBox();
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
            this.mouseDown = false;
        }
    }

    drawSelectionBox(): void {
        const ctx = this.drawingService.previewCtx;
        ctx.beginPath();
        ctx.strokeStyle = '#111155';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        const radius = this.selectionBox.circleRadius;
        const xCenter = this.selectionBox.squareCenter.x;
        const yCenter = this.selectionBox.squareCenter.y;
        ctx.arc(xCenter, yCenter, radius, 0, 2 * Math.PI);

        ctx.stroke();
        ctx.setLineDash([]);
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const options = drawingAction.options;
        if (drawingAction.box && options.size && options.traceType !== undefined && options.secondaryColor && options.numberOfSides) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const corners: Vec2[] = this.getCornersPosition(drawingAction.box, options.numberOfSides);
            const startingPoint = corners.shift();
            if (startingPoint) {
                ctx.beginPath();
                ctx.lineWidth = options.size;
                ctx.moveTo(startingPoint.x, startingPoint.y);
                for (const corner of corners) {
                    ctx.lineTo(corner.x, corner.y);
                }
                ctx.lineTo(startingPoint.x, startingPoint.y);
                this.fill(ctx, options.traceType, options.primaryColor, options.secondaryColor);
                ctx.closePath();
            }
        }
    }

    // equations found here: https://stackoverflow.com/questions/3436453/calculate-coordinates-of-a-regular-polygons-vertices
    private getCornersPosition(box: Box, nSides: number): Vec2[] {
        const radius = box.width / 2;
        const positions: Vec2[] = [];
        for (let i = 0; i < nSides; i++) {
            const x = box.center.x + radius * Math.cos((2 * Math.PI * i) / nSides);
            const y = box.center.y + radius * Math.sin((2 * Math.PI * i) / nSides);
            positions.push({ x, y });
        }
        return positions;
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            numberOfSides: this.options.numberOfSides,
            size: this.options.size,
            traceType: this.options.traceType,
        };
        const box = new BoundingBox();
        box.updateFromSelectionBox(this.selectionBox, true);
        return {
            id: drawingToolId.polygonService,
            box,
            options,
        };
    }
}
