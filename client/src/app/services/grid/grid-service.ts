import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

export const DEFAULT_TRANSPARENCY = 0.5;
export const DEFAULT_GRID_SIZE = 10;

@Injectable({
    providedIn: 'root',
})
export class GridService {
    squareSize: number;
    transparency: number;
    isShown: boolean;
    constructor(private drawingService: DrawingService) {
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        this.isShown = false;
        this.squareSize = DEFAULT_GRID_SIZE;
        this.transparency = DEFAULT_TRANSPARENCY;
    }

    onOptionChange(): void {
        if (this.isShown) {
            this.clearGrid();
            this.drawGrid();
        }
    }

    toggleGrid(): void {
        if (this.isShown) {
            this.clearGrid();
        } else {
            this.drawGrid();
        }
        this.isShown = !this.isShown;
    }

    private clearGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    private setContextOptions(): void {
        const ctx = this.drawingService.gridCtx;
        ctx.globalAlpha = this.transparency;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
    }

    drawGrid(): void {
        this.setContextOptions();
        const ctx = this.drawingService.gridCtx;
        ctx.beginPath();
        const width = this.drawingService.canvas.width;
        const height = this.drawingService.canvas.height;

        for (let xPosition = this.squareSize; xPosition < width; xPosition += this.squareSize) {
            ctx.moveTo(xPosition, 0);
            ctx.lineTo(xPosition, height);
        }

        for (let yPosition = this.squareSize; yPosition < height; yPosition += this.squareSize) {
            ctx.moveTo(0, yPosition);
            ctx.lineTo(width, yPosition);
        }
        ctx.stroke();
    }
}
