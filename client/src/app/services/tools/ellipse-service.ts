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
export class EllipseService extends Tool {
    initialCoord: Vec2;

    constructor(drawingService: DrawingService, private colorSelectionService: ColorSelectionService) {
        super(drawingService);
        this.size = 0;
        this.traceType = TraceTypes.fill;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentPosition = this.getPositionFromMouse(event);
            this.initialCoord = currentPosition;
            this.mouseDownCoord = currentPosition;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawEllipse(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.mouseDown = false;
            this.drawEllipse(this.drawingService.baseCtx);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawEllipse(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.drawEllipse(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.drawEllipse(this.drawingService.previewCtx);
            }
        }
    }

    private drawEllipse(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        const xRadius = (this.mouseDownCoord.x - this.initialCoord.x) / 2;
        const yRadius = (this.mouseDownCoord.y - this.initialCoord.y) / 2;
        ctx.lineWidth = this.size!;

        if (this.shiftDown) {
            const smallestRadius = Math.min(Math.abs(xRadius), Math.abs(yRadius));
            const xMiddle = this.initialCoord.x + smallestRadius * Math.sign(xRadius);
            const yMiddle = this.initialCoord.y + smallestRadius * Math.sign(yRadius);
            ctx.arc(xMiddle, yMiddle, smallestRadius, 0, 2 * Math.PI);
        } else {
            const xMiddle = this.initialCoord.x + xRadius;
            const yMiddle = this.initialCoord.y + yRadius;
            ctx.ellipse(xMiddle, yMiddle, Math.abs(xRadius), Math.abs(yRadius), 0, 0, 2 * Math.PI);
        }

        switch (this.traceType) {
            case TraceTypes.fill: {
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.fillStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.fill();
                break;
            }
            case TraceTypes.stroke: {
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.strokeStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.strokeStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.stroke();
                break;
            }
            case TraceTypes.fillAndStroke: {
                ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                ctx.strokeStyle = this.colorSelectionService.secondaryColor.getRgbString();
                ctx.fill();
                ctx.stroke();
                break;
            }
            default: {
                if (this.colorSelection === ColorSelection.primary) {
                    ctx.fillStyle = this.colorSelectionService.primaryColor.getRgbString();
                } else if (this.colorSelection === ColorSelection.secondary) {
                    ctx.fillStyle = this.colorSelectionService.secondaryColor.getRgbString();
                }
                ctx.fill();
                break;
            }
        }
    }
}
