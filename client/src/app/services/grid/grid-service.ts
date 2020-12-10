import { Injectable, OnDestroy } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { AnchorsPosition } from '@app/shared/enum';
import { Subject } from 'rxjs';

export const DEFAULT_TRANSPARENCY = 0.5;
export const DEFAULT_GRID_SIZE = 10;
export const MAX_GRID_SIZE = 200;
export const GRID_INCREMENT = 5;

@Injectable({
    providedIn: 'root',
})
export class GridService implements OnDestroy {
    squareSize: number;
    transparency: number;
    isShown: boolean;
    shouldSnapToGrid: boolean;
    currentAnchor: AnchorsPosition;
    onMagnetismStateChange: Subject<void>;

    constructor(private drawingService: DrawingService, private shortcutService: ShortcutService) {
        this.setDefaultOptions();
        this.onMagnetismStateChange = new Subject();
        this.addShortcut();
    }

    ngOnDestroy(): void {
        this.onMagnetismStateChange.complete();
    }

    setDefaultOptions(): void {
        this.isShown = false;
        this.shouldSnapToGrid = false;
        this.currentAnchor = AnchorsPosition.topLeft;
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
        this.isShown = !this.isShown;
        if (this.isShown) {
            this.drawGrid();
        } else {
            this.clearGrid();
        }
    }

    toggleMagnetism(): void {
        this.shouldSnapToGrid = !this.shouldSnapToGrid;
        this.onMagnetismStateChange.next();
    }

    setAnchor(anchor: AnchorsPosition): void {
        this.currentAnchor = anchor;
        this.onMagnetismStateChange.next();
    }

    drawGrid(): void {
        this.setContextOptions();
        const ctx = this.drawingService.gridCtx;
        ctx.beginPath();
        const width = this.canvasWidth;
        const height = this.canvasHeight;

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

    private clearGrid(): void {
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    private setContextOptions(): void {
        const ctx = this.drawingService.gridCtx;
        ctx.globalAlpha = this.transparency;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
    }

    private addShortcut(): void {
        this.shortcutService.shortcuts
            .set('+', () => {
                this.squareSize += GRID_INCREMENT;
                if (this.squareSize >= MAX_GRID_SIZE) {
                    this.squareSize = MAX_GRID_SIZE;
                }
                this.onOptionChange();
            })
            .set('S-+', () => {
                this.squareSize += GRID_INCREMENT;
                if (this.squareSize >= MAX_GRID_SIZE) {
                    this.squareSize = MAX_GRID_SIZE;
                }
                this.onOptionChange();
            })
            .set('-', () => {
                this.squareSize -= GRID_INCREMENT;
                if (this.squareSize < DEFAULT_GRID_SIZE) {
                    this.squareSize = DEFAULT_GRID_SIZE;
                }
                this.onOptionChange();
            })
            .set('g', () => {
                this.toggleGrid();
            })
            .set('m', () => {
                this.toggleMagnetism();
            });
        this.shortcutService.alwaysEnabledShorcuts.add('-').add('S-+').add('+').add('g').add('m');
    }

    get canvasWidth(): number {
        return this.drawingService.canvas.width;
    }

    get canvasHeight(): number {
        return this.drawingService.canvas.height;
    }
}
