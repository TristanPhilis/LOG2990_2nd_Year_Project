import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ANGLE_ROTATION, DEFAULT_OPTIONS, DEG_TO_RAD_FACTOR, ROTATION_COMPLETE, STAMPS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    private availableStamps: string[];
    mousePosition: Vec2;
    constructor(drawingService: DrawingService, colorService: ColorSelectionService) {
        super(drawingService, colorService);
        this.setDefaultOptions();
        this.availableStamps = STAMPS;
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.stampSize, { value: DEFAULT_OPTIONS.size, displayName: 'Grosseur' }],
            [Options.stamp, { value: DEFAULT_OPTIONS.stamp, displayName: 'Etampes' }],
            [Options.angle, { value: DEFAULT_OPTIONS.angle, displayName: 'Angle' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            const drawingAction = this.getDrawingAction();
            this.draw(this.drawingService.baseCtx, drawingAction);
            this.action.next(drawingAction);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
        this.draw(this.drawingService.previewCtx, this.getDrawingAction());
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const stampScaleModifier = drawingAction.options.toolOptions.get(Options.stampSize);
        const stamp = drawingAction.options.toolOptions.get(Options.stamp);
        const angle = drawingAction.options.toolOptions.get(Options.angle);
        const mousePosition = drawingAction.mousePosition;
        const image = new Image();
        if (stamp && stampScaleModifier && angle && mousePosition) {
            image.src = this.availableStamps[stamp.value];

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const imagePositionX = mousePosition.x / stampScaleModifier.value - image.width / 2;
            const imagePositionY = mousePosition.y / stampScaleModifier.value - image.height / 2;
            ctx.scale(stampScaleModifier.value, stampScaleModifier.value);
            ctx.translate(mousePosition.x / stampScaleModifier.value, mousePosition.y / stampScaleModifier.value);
            ctx.rotate(DEG_TO_RAD_FACTOR * angle.value);
            ctx.translate(-mousePosition.x / stampScaleModifier.value, -mousePosition.y / stampScaleModifier.value);
            ctx.drawImage(image, imagePositionX, imagePositionY);
            ctx.resetTransform();
        }
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const changeAngle = event.altKey ? 1 : 1 * ANGLE_ROTATION;
        const angle = this.options.toolOptions.get(Options.angle);
        if (!angle) {
            return;
        }
        let newAngle = angle.value + Math.sign(event.deltaY) * changeAngle;
        if (newAngle < 0) {
            newAngle += ROTATION_COMPLETE;
        } else if (newAngle > ROTATION_COMPLETE) {
            newAngle -= ROTATION_COMPLETE;
        }
        angle.value = newAngle;
        this.options.toolOptions.set(Options.angle, angle);
        this.draw(this.drawingService.previewCtx, this.getDrawingAction());
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.stampService,
            mousePosition: this.mousePosition,
            options,
        };
    }
}
