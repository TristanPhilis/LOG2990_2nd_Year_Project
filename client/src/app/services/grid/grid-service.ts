import { Injectable } from '@angular/core';
import { DrawingService } from '../drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    squareSize: number;
    transparency: number;
    constructor(private drawingService: DrawingService) {
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        this.squareSize = 10;
        this.transparency = 0.5;
    }

    setContextOptions(): void {
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

    removegrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }
}
