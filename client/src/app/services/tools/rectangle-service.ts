import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { ColorSelection, MouseButton, TraceTypes } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    initialCoord: Vec2;

    constructor(drawingService: DrawingService, private colorSelectionService: ColorSelectionService) {
        super(drawingService);
        this.size = 0;
        this.traceType = 0;
    }

    set _traceType(newType: TraceTypes) {
        this.traceType = newType;
    }

    get _traceType(): TraceTypes {
        return this.traceType!;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.initialCoord = currentCoord;
            this.mouseDownCoord = currentCoord;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawRectangle(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawRectangle(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.drawRectangle(this.drawingService.baseCtx);
            this.mouseDown = false;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.drawRectangle(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.drawRectangle(this.drawingService.previewCtx);
            }
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        // tslint:disable-next-line: prefer-const

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        ctx.lineWidth = this.size!;

        if (this.shiftDown) {
            const squareSize = Math.min(Math.abs(width), Math.abs(height));
            ctx.rect(this.initialCoord.x, this.initialCoord.y, squareSize * Math.sign(width), squareSize * Math.sign(height));
        } else {
            ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
        }

        switch (this.traceType) {
            case TraceTypes.fill:
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.fillStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.fill();
                break;
            case TraceTypes.stroke:
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.strokeStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.strokeStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.stroke();
                break;
            case TraceTypes.fillAndStroke:
                ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                ctx.strokeStyle = this.colorSelectionService.secondaryColor.getRgbString();
                ctx.fill();
                ctx.stroke();
                break;
            default:
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.fillStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.fill();
        }
    }
}
