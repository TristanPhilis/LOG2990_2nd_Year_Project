import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AEROSOL_CONVERTER_TIMER, AEROSOL_DENSITY, DEFAULT_OPTIONS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class SprayService extends Tool {
    private pathData: Vec2[];
    private sprayTimerHandler: number;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService) {
        super(drawingService, colorService);
        this.clearPath();
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.spraySize, { value: DEFAULT_OPTIONS.spraySize, displayName: 'diametre du jet' }],
            [Options.sprayDiameter, { value: DEFAULT_OPTIONS.sprayDiameter, displayName: 'diametre des gouttelettes' }],
            [Options.emissionPerSecond, { value: DEFAULT_OPTIONS.emissionPerSecond, displayName: 'emission par seconde' }],
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
        this.startSpray();
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }
        this.mouseDown = false;
        clearInterval(this.sprayTimerHandler);
        const drawingAction = this.getDrawingAction();
        this.action.next(drawingAction);
        this.clearPath();
        this.draw(this.drawingService.baseCtx, drawingAction);
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
    }

    startSpray(): void {
        const sizeSpray = this.getDrawingAction().options.toolOptions.get(Options.spraySize);
        const emissionPerSecond = this.getDrawingAction().options.toolOptions.get(Options.emissionPerSecond);
        if (sizeSpray && emissionPerSecond) {
            this.sprayTimerHandler = window.setInterval(() => {
                for (let i = AEROSOL_DENSITY; i--; ) {
                    const center = this.mouseDownCoord;
                    const angle = this.getRandomFloat(0, Math.PI * 2);
                    const distanceFromCenter = this.getRandomFloat(0, sizeSpray.value);
                    const xDistance = distanceFromCenter * Math.cos(angle);
                    const yDistance = distanceFromCenter * Math.sin(angle);
                    const newPoint = {
                        x: center.x + xDistance,
                        y: center.y + yDistance,
                    };
                    this.pathData.push(newPoint);
                }
                this.draw(this.drawingService.baseCtx, this.getDrawingAction());
            }, emissionPerSecond.value * AEROSOL_CONVERTER_TIMER);
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const path = drawingAction.path;
        const diameters = drawingAction.options.toolOptions.get(Options.sprayDiameter);
        if (path && diameters) {
            ctx.beginPath();
            for (const point of path) {
                ctx.moveTo(point.x, point.y);
                ctx.arc(point.x, point.y, diameters.value, 0, 2 * Math.PI);
            }
            ctx.fillStyle = drawingAction.options.primaryColor.getRgbString();
            ctx.fill();
        }
        this.drawingService.autoSave();
    }

    // this function come from https://codepen.io/kangax/pen/itmrd
    getRandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.aerosolService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
