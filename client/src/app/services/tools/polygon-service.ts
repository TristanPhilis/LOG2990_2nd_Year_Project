import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL } from '@app/shared/constant';
import { MouseButton, TraceTypes } from '@app/shared/enum';

export const MAX_SIDES = 12;
export const MIN_SIDES = 3;

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends Tool {
    selectionBox: SelectionBox;
    nSides: number;
    traceType: TraceTypes;

    constructor(drawingService: DrawingService, private colorService: ColorSelectionService) {
        super(drawingService);
        this.initializeDefaultOptions();
    }

    private initializeDefaultOptions(): void {
        this.selectionBox = new SelectionBox();
        this.nSides = MIN_SIDES;
        this.traceType = TraceTypes.stroke;
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
            this.draw(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.selectionBox.updateOpposingCorner(this.getPositionFromMouse(event));
            this.draw(this.drawingService.previewCtx);
            this.drawSelectionBox();
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx);
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

    draw(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const corners: Vec2[] = this.getCornersPosition();
        const startingPoint = corners.shift();
        if (startingPoint) {
            ctx.beginPath();
            ctx.moveTo(startingPoint.x, startingPoint.y);
            for (const corner of corners) {
                ctx.lineTo(corner.x, corner.y);
            }
            ctx.lineTo(startingPoint.x, startingPoint.y);
            this.fill(ctx);
            ctx.closePath();
        }
    }

    private fill(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.colorService.primaryColor.getRgbString();
        ctx.strokeStyle = this.colorService.secondaryColor.getRgbString();
        switch (this.traceType) {
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

    // equations found here: https://stackoverflow.com/questions/3436453/calculate-coordinates-of-a-regular-polygons-vertices
    private getCornersPosition(): Vec2[] {
        const center: Vec2 = this.selectionBox.squareCenter;
        const radius = this.selectionBox.circleRadius;
        const positions: Vec2[] = [];
        for (let i = 0; i < this.nSides; i++) {
            const x = center.x + radius * Math.cos((2 * Math.PI * i) / this.nSides);
            const y = center.y + radius * Math.sin((2 * Math.PI * i) / this.nSides);
            positions.push({ x, y });
        }
        return positions;
    }
}
