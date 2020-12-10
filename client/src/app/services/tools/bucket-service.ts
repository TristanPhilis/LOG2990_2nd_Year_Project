import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { isColorSimilar } from '@app/classes/color-comparison-helper';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { A_POSITION, B_POSITION, DEFAULT_OPTIONS, G_POSITION, MAX_TOLERANCE, PIXEL_INTERVAL, R_POSITION } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';
import { SearchHelper } from '@app/utils/search-helper';

@Injectable({
    providedIn: 'root',
})
export class BucketService extends Tool {
    endColor: Color;

    pixelsData: Uint8ClampedArray;
    canvasSize: Vec2;
    visitedPixel: boolean[];
    pixelToVisit: Vec2[];
    initialColor: Color;
    boundingBox: BoundingBox;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
        this.pixelsData = new Uint8ClampedArray();
        this.boundingBox = new BoundingBox();
        this.visitedPixel = [];
        this.pixelToVisit = [];
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([[Options.tolerance, { value: DEFAULT_OPTIONS.tolerance, displayName: 'Tolérance' }]]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        const isLeftClick = event.buttons === MouseButton.Left;
        const isRightClick = event.buttons === MouseButton.Right;
        if (!isLeftClick && !isRightClick) {
            return;
        }

        if (this.tolerance === MAX_TOLERANCE) {
            this.drawingService.fillCanvas(this.primaryColor.getRgbString());
            this.setParamsForMaxTolerance();
            this.action.next(this.getDrawingAction());
        } else {
            const initialCoord = this.getPositionFromMouse(event);
            this.initSearchParams(initialCoord);
            if (isLeftClick) {
                this.beginBFS(initialCoord);
            } else {
                this.beginLinearSearch();
            }
        }
    }

    private setParamsForMaxTolerance(): void {
        this.pixelsData = this.drawingService.getImageData().data;
        this.canvasSize = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.boundingBox.setStartingCoord({ x: 0, y: 0 });
        this.boundingBox.update({ x: this.canvasSize.x, y: this.canvasSize.y });
    }

    private initSearchParams(initialCoord: Vec2): void {
        this.pixelsData = this.drawingService.getImageData().data;
        this.canvasSize = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };

        this.endColor = this.primaryColor;
        this.initialColor = SearchHelper.getColorFromCoord(initialCoord, this.canvasSize, this.pixelsData);

        this.boundingBox = new BoundingBox();
        this.boundingBox.setStartingCoord(initialCoord);
    }

    private beginBFS(startingCoord: Vec2): void {
        this.visitedPixel = new Array(this.pixelsData.length).fill(false);
        this.visitedPixel[SearchHelper.getIndexFromCoord(startingCoord, this.canvasSize)] = true;
        this.pixelToVisit = [startingCoord];

        let currentPixelCoord;
        while (this.pixelToVisit.length > 0) {
            currentPixelCoord = this.pixelToVisit.shift() as Vec2;
            this.boundingBox.update(currentPixelCoord);
            this.addAdjacentPixel(currentPixelCoord);
            const currentPixelIndex = SearchHelper.getIndexFromCoord(currentPixelCoord, this.canvasSize);
            this.fillPixel(currentPixelIndex);
        }
        const action = this.getDrawingAction();
        this.action.next(action);
        this.draw(this.drawingService.baseCtx, action);
    }

    private beginLinearSearch(): void {
        for (let colorIndex = 0; colorIndex < this.pixelsData.length; colorIndex += PIXEL_INTERVAL) {
            const currentColor = SearchHelper.getColorFromIndex(colorIndex, this.pixelsData);
            if (this.isColorSimilar(currentColor)) {
                this.boundingBox.update(SearchHelper.getCoordFromIndex(colorIndex, this.canvasSize));
                this.fillPixel(colorIndex);
            }
        }
        const action = this.getDrawingAction();
        this.action.next(action);
        this.draw(this.drawingService.baseCtx, action);
    }

    private addAdjacentPixel(startingCoord: Vec2): void {
        const coordsToCheck = SearchHelper.getAdjacentCoords(startingCoord);
        for (const coord of coordsToCheck) {
            if (this.shouldAddCoord(coord)) {
                this.visitedPixel[SearchHelper.getIndexFromCoord(coord, this.canvasSize)] = true;
                this.pixelToVisit.push(coord);
            }
        }
    }

    private shouldAddCoord(coord: Vec2): boolean {
        if (!this.isValidCoord(coord) || SearchHelper.wasCoordVisited(coord, this.canvasSize, this.visitedPixel)) {
            return false;
        }

        const currentColor = SearchHelper.getColorFromCoord(coord, this.canvasSize, this.pixelsData);
        return this.isColorSimilar(currentColor);
    }

    private fillPixel(colorIndex: number): void {
        this.pixelsData[colorIndex + R_POSITION] = this.endColor.r;
        this.pixelsData[colorIndex + G_POSITION] = this.endColor.g;
        this.pixelsData[colorIndex + B_POSITION] = this.endColor.b;
        this.pixelsData[colorIndex + A_POSITION] = this.endColor.a * MAX_RGBA_VALUE;
    }

    private isValidCoord(coord: Vec2): boolean {
        return this.drawingService.isCoordInCanvas(coord);
    }

    private isColorSimilar(color: Color): boolean {
        return isColorSimilar(this.initialColor, color, this.tolerance);
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        if (drawingAction.box && drawingAction.imageData) {
            ctx.putImageData(
                drawingAction.imageData,
                0,
                0,
                drawingAction.box.position.x,
                drawingAction.box.position.y,
                drawingAction.box.width + 1,
                drawingAction.box.height + 1,
            );
        }
        this.drawingService.autoSave();
    }

    getDrawingAction(): DrawingAction {
        const newImageData = new ImageData(this.pixelsData, this.canvasSize.x, this.canvasSize.y);
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.bucketService,
            box: this.boundingBox.copy(),
            imageData: newImageData,
            options,
        };
    }

    get tolerance(): number {
        const tolerance = this.options.toolOptions.get(Options.tolerance);
        return tolerance ? tolerance.value : DEFAULT_OPTIONS.tolerance;
    }
}
