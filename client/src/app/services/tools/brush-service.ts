import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { DEFAULT_OPTIONS, TEXTURES } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    private pathData: Vec2[];
    private availableTextures: string[];

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
        this.clearPath();
        this.setDefaultOptions();
        this.availableTextures = TEXTURES;
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.size, { value: DEFAULT_OPTIONS.size, displayName: 'Largeur' }],
            [Options.texture, { value: DEFAULT_OPTIONS.texture, displayName: 'Texture' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.onActionStart();
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            const drawingAction = this.getDrawingAction();
            this.action.next(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
        }
        this.mouseDown = false;
        this.clearPath();
        this.onActionFinish();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // We draw on the preview canvas and erase it each time the mouse is moved
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
            this.onActionFinish();
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const size = drawingAction.options.toolOptions.get(Options.size);
        const texture = drawingAction.options.toolOptions.get(Options.texture);
        if (drawingAction.path && size && texture) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineWidth = size.value;
            const image = new Image(1, 1);
            image.src = this.availableTextures[texture.value];
            const pattern = ctx.createPattern(image, 'repeat');
            if (pattern !== null) ctx.strokeStyle = pattern;
            for (const point of drawingAction.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.globalCompositeOperation = 'color';
            ctx.strokeStyle = drawingAction.options.primaryColor.getRgbString();
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
        this.drawingService.autoSave();
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };

        return {
            id: DrawingToolId.brushService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
