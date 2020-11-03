import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { isColorSimilar } from '@app/classes/color-comparison-helper';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { A_POSITION, B_POSITION, G_POSITION, MAX_TOLERANCE, MIN_TOLERANCE, PIXEL_INTERVAL, R_POSITION } from '@app/shared/constant';
import { drawingToolId, MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class BucketService extends Tool {
    tolerance: number;
    endColor: Color;

    pixelsData: Uint8ClampedArray;
    canvasSize: Vec2;
    visitedPixel: boolean[];
    pixelToVisit: Vec2[];
    initialColor: Color;
    boundingBox: BoundingBox;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.tolerance = MIN_TOLERANCE;
        this.pixelsData = new Uint8ClampedArray();
        this.boundingBox = new BoundingBox();
        this.visitedPixel = [];
        this.pixelToVisit = [];
    }

    onMouseDown(event: MouseEvent): void {
        const isLeftClick = event.buttons === MouseButton.Left;
        const isRightClick = event.buttons === MouseButton.Right;
        if (!isLeftClick && !isRightClick) {
            return;
        }

        if (this.tolerance === MAX_TOLERANCE) {
            this.drawingService.fillCanvas(this.primaryColor.getRgbString());
            this.pixelsData = this.drawingService.getImageData().data;
            this.boundingBox.setStartingCoord({ x: 0, y: 0 });
            this.boundingBox.update({ x: this.canvasSize.x, y: this.canvasSize.y });
            this.undoRedoService.saveAction(this.getDrawingAction());
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

    private initSearchParams(initialCoord: Vec2): void {
        this.pixelsData = this.drawingService.getImageData().data;
        this.canvasSize = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };

        this.endColor = this.primaryColor;
        this.initialColor = this.getColorFromCoord(initialCoord);

        this.boundingBox = new BoundingBox();
        this.boundingBox.setStartingCoord(initialCoord);
    }

    private beginBFS(startingCoord: Vec2): void {
        this.visitedPixel = new Array(this.pixelsData.length).fill(false);
        this.visitedPixel[this.getIndexFromCoord(startingCoord)] = true;
        this.pixelToVisit = [startingCoord];

        let currentPixelCoord;
        while (this.pixelToVisit.length > 0) {
            currentPixelCoord = this.pixelToVisit.shift();
            if (currentPixelCoord) {
                this.boundingBox.update(currentPixelCoord);
                this.addAdjacentPixel(currentPixelCoord);
                const currentPixelIndex = this.getIndexFromCoord(currentPixelCoord);
                this.fillPixel(currentPixelIndex);
            }
        }
        const action = this.getDrawingAction();
        this.undoRedoService.saveAction(action);
        this.draw(this.drawingService.baseCtx, action);
    }

    private beginLinearSearch(): void {
        for (let colorIndex = 0; colorIndex < this.pixelsData.length; colorIndex += PIXEL_INTERVAL) {
            const currentColor = this.getColorFromIndex(colorIndex);
            if (this.isColorSimilar(currentColor)) {
                this.boundingBox.update(this.getCoordFromIndex(colorIndex));
                this.fillPixel(colorIndex);
            }
        }
        const action = this.getDrawingAction();
        this.undoRedoService.saveAction(action);
        this.draw(this.drawingService.baseCtx, action);
    }

    private addAdjacentPixel(startingCoord: Vec2): void {
        const coordsToCheck: Vec2[] = [
            { x: startingCoord.x - 1, y: startingCoord.y },
            { x: startingCoord.x + 1, y: startingCoord.y },
            { x: startingCoord.x, y: startingCoord.y - 1 },
            { x: startingCoord.x, y: startingCoord.y + 1 },
        ];
        for (const coord of coordsToCheck) {
            if (this.shouldAddCoord(coord)) {
                this.visitedPixel[this.getIndexFromCoord(coord)] = true;
                this.pixelToVisit.push(coord);
            }
        }
    }

    private shouldAddCoord(coord: Vec2): boolean {
        if (!this.isValidCoord(coord) || this.wasCoordVisited(coord)) {
            return false;
        }

        const currentColor = this.getColorFromCoord(coord);
        return this.isColorSimilar(currentColor);
    }

    private fillPixel(colorIndex: number): void {
        this.pixelsData[colorIndex + R_POSITION] = this.endColor.r;
        this.pixelsData[colorIndex + G_POSITION] = this.endColor.g;
        this.pixelsData[colorIndex + B_POSITION] = this.endColor.b;
        this.pixelsData[colorIndex + A_POSITION] = this.endColor.a * MAX_RGBA_VALUE;
    }

    private getColorFromCoord(coord: Vec2): Color {
        const colorIndex = this.getIndexFromCoord(coord);
        return this.getColorFromIndex(colorIndex);
    }

    private getColorFromIndex(colorIndex: number): Color {
        return new Color(
            this.pixelsData[colorIndex + R_POSITION],
            this.pixelsData[colorIndex + G_POSITION],
            this.pixelsData[colorIndex + B_POSITION],
            this.pixelsData[colorIndex + A_POSITION] / MAX_RGBA_VALUE,
        );
    }

    private getIndexFromCoord(coord: Vec2): number {
        return (coord.x + this.canvasSize.x * coord.y) * PIXEL_INTERVAL;
    }

    private getCoordFromIndex(colorIndex: number): Vec2 {
        const y = Math.floor(colorIndex / PIXEL_INTERVAL / this.canvasSize.x);
        const x = colorIndex / PIXEL_INTERVAL - this.canvasSize.x * y;
        return { x, y };
    }

    private isValidCoord(coord: Vec2): boolean {
        return this.drawingService.isCoordInCanvas(coord);
    }

    private wasCoordVisited(coord: Vec2): boolean {
        return this.visitedPixel[this.getIndexFromCoord(coord)];
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
    }

    getDrawingAction(): DrawingAction {
        const newImageData = new ImageData(this.pixelsData, this.canvasSize.x, this.canvasSize.y);
        const options = {
            primaryColor: this.primaryColor,
        };
        return {
            id: drawingToolId.bucketService,
            box: this.boundingBox,
            imageData: newImageData,
            options,
        };
    }
}
