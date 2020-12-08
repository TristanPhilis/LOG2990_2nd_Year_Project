import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Selector } from '@app/classes/selector';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { A_POSITION, B_POSITION, G_POSITION, PIXEL_INTERVAL, R_POSITION } from '@app/shared/constant';
import { SelectionType } from '@app/shared/enum';
import { CanvasManipulationService } from '@app/utils/canvas-manipulation-service';
import { SearchHelper } from '@app/utils/search-helper';

@Injectable({
    providedIn: 'root',
})
export class MagicSelectorService extends Selector {
    private boundingBox: BoundingBox;
    private colorToMatch: Color;
    private pixelsData: Uint8ClampedArray;
    private matchingImageData: ImageData;
    private contourImageData: ImageData;
    private pixelsToVisit: Vec2[];
    private initialSelectedPixels: number[];
    private visitedPixels: boolean[];
    private canvasSize: Vec2;
    private contoursCanvas: HTMLCanvasElement;
    private contoursCtx: CanvasRenderingContext2D;
    private fillCanvas: HTMLCanvasElement;
    private fillCtx: CanvasRenderingContext2D;

    constructor(drawingService: DrawingService, private canvasUtil: CanvasManipulationService) {
        super(drawingService);
        this.id = SelectionType.magic;
        this.boundingBox = new BoundingBox();
        this.pixelsToVisit = [];
        this.visitedPixels = [];
        this.initialSelectedPixels = [];
        this.canvasSize = { x: 0, y: 0 };
    }

    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {
        return;
    }

    copyArea(box: SelectedBox): SelectionImageData {
        return {
            imageData: this.getFinalImageData(),
            initialSelectedPixels: this.initialSelectedPixels,
            contourImage: this.getContourImage(),
        };
    }

    clearInitialSelectedZone(selectionImageData: SelectionImageData): void {
        const pixelsToClear = selectionImageData.initialSelectedPixels;
        if (!pixelsToClear) {
            return;
        }

        const imageData = this.drawingService.getImageData();
        const white = new Color(MAX_RGBA_VALUE, MAX_RGBA_VALUE, MAX_RGBA_VALUE);
        for (const pixelIndex of pixelsToClear) {
            imageData.data[pixelIndex + R_POSITION] = white.r;
            imageData.data[pixelIndex + G_POSITION] = white.g;
            imageData.data[pixelIndex + B_POSITION] = white.b;
            imageData.data[pixelIndex + A_POSITION] = white.a * MAX_RGBA_VALUE;
        }
        this.drawingService.setImageData(imageData);
    }

    executeMagicSelection(initialCoord: Vec2, isLeftClick: boolean): SelectedBox {
        this.initSearchParams(initialCoord);
        if (isLeftClick) {
            this.beginBFS(initialCoord);
        } else {
            this.beginLinearSearch();
        }
        const selectedBox = new SelectedBox();
        selectedBox.updateFromBoundingBox(this.boundingBox);
        selectedBox.right += 1;
        selectedBox.bottom += 1;
        return selectedBox;
    }

    private getFinalImageData(): ImageData {
        this.fillCtx.putImageData(this.matchingImageData, 0, 0);
        return this.fillCtx.getImageData(this.boundingBox.left, this.boundingBox.top, this.boundingBox.width + 1, this.boundingBox.height + 1);
    }

    private getContourImage(): CanvasImageSource {
        const canvas = this.canvasUtil.createCanvas(this.boundingBox.width, this.boundingBox.height);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.contoursCtx.putImageData(this.contourImageData, 0, 0);
        const boundedContourImageData = this.contoursCtx.getImageData(
            this.boundingBox.left,
            this.boundingBox.top,
            this.boundingBox.width,
            this.boundingBox.height,
        );
        ctx.putImageData(boundedContourImageData, 0, 0);

        return canvas;
    }

    private initSearchParams(initialCoord: Vec2): void {
        this.pixelsToVisit = [];
        this.initialSelectedPixels = [];
        this.canvasSize = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.pixelsData = this.drawingService.getImageData().data;
        this.colorToMatch = SearchHelper.getColorFromCoord(initialCoord, this.canvasSize, this.pixelsData);
        this.boundingBox.setStartingCoord(initialCoord);
        this.visitedPixels = new Array(this.pixelsData.length).fill(false);
        this.initializeCanvas();
    }

    private initializeCanvas(): void {
        this.contoursCanvas = this.canvasUtil.createCanvas(this.canvasSize.x, this.canvasSize.y);
        this.contoursCtx = this.contoursCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.fillCanvas = this.canvasUtil.createCanvas(this.canvasSize.x, this.canvasSize.y);
        this.fillCtx = this.fillCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.matchingImageData = this.fillCtx.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.contourImageData = this.contoursCtx.getImageData(0, 0, this.canvasSize.x, this.canvasSize.y);
    }

    private beginLinearSearch(): void {
        for (let colorIndex = 0; colorIndex < this.pixelsData.length; colorIndex += PIXEL_INTERVAL) {
            const currentColor = SearchHelper.getColorFromIndex(colorIndex, this.pixelsData);
            if (currentColor.equal(this.colorToMatch)) {
                this.initialSelectedPixels.push(colorIndex);
                const currentPixelCoord = SearchHelper.getCoordFromIndex(colorIndex, this.canvasSize);
                this.boundingBox.update(currentPixelCoord);
                this.fillPixelsAtCoord(currentPixelCoord);
                this.checkForEdges(currentPixelCoord);
            }
        }
    }

    private beginBFS(initialCoord: Vec2): void {
        this.pixelsToVisit.push(initialCoord);
        this.visitedPixels[SearchHelper.getIndexFromCoord(initialCoord, this.canvasSize)] = true;

        while (this.pixelsToVisit.length > 0) {
            const currentPixelCoord = this.pixelsToVisit.shift() as Vec2;
            this.initialSelectedPixels.push(SearchHelper.getIndexFromCoord(currentPixelCoord, this.canvasSize));

            this.boundingBox.update(currentPixelCoord);

            this.fillPixelsAtCoord(currentPixelCoord);
            this.checkForEdges(currentPixelCoord);
            this.addAdjacentPixelsInVisitQueue(currentPixelCoord);
        }
    }

    private fillPixelsAtCoord(coord: Vec2): void {
        const pixelIndex = SearchHelper.getIndexFromCoord(coord, this.canvasSize);
        this.matchingImageData.data[pixelIndex + R_POSITION] = this.colorToMatch.r;
        this.matchingImageData.data[pixelIndex + G_POSITION] = this.colorToMatch.g;
        this.matchingImageData.data[pixelIndex + B_POSITION] = this.colorToMatch.b;
        this.matchingImageData.data[pixelIndex + A_POSITION] = this.colorToMatch.a * MAX_RGBA_VALUE;
    }

    private checkForEdges(coord: Vec2): void {
        const adjacentCoords = SearchHelper.getAdjacentCoords(coord);

        adjacentCoords.forEach((adjacentCoord: Vec2) => {
            const color = SearchHelper.getColorFromCoord(adjacentCoord, this.canvasSize, this.pixelsData);

            if (!color.equal(this.colorToMatch) || !this.drawingService.isCoordInCanvas(adjacentCoord)) {
                let pixelIndex = SearchHelper.getIndexFromCoord(coord, this.canvasSize);
                this.contourImageData.data[pixelIndex + A_POSITION] = MAX_RGBA_VALUE;
                pixelIndex = SearchHelper.getIndexFromCoord(adjacentCoord, this.canvasSize);
                this.contourImageData.data[pixelIndex + A_POSITION] = MAX_RGBA_VALUE;
            }
        });
    }

    private addAdjacentPixelsInVisitQueue(referenceCoord: Vec2): void {
        const coordsToCheck = SearchHelper.getAdjacentCoords(referenceCoord);
        for (const coord of coordsToCheck) {
            if (this.shouldAddCoord(coord)) {
                const pixelIndex = SearchHelper.getIndexFromCoord(coord, this.canvasSize);
                this.visitedPixels[pixelIndex] = true;
                this.pixelsToVisit.push(coord);
            }
        }
    }

    private shouldAddCoord(coord: Vec2): boolean {
        if (!this.drawingService.isCoordInCanvas(coord) || SearchHelper.wasCoordVisited(coord, this.canvasSize, this.visitedPixels)) {
            return false;
        }
        const currentColor = SearchHelper.getColorFromCoord(coord, this.canvasSize, this.pixelsData);
        return currentColor.equal(this.colorToMatch);
    }
}
