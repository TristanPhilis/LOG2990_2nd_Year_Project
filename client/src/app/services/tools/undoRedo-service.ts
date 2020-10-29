import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { UndoRedoPile } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil-service';
import { BrushService } from './brush.service';
import { EllipseService } from './ellipse-service';
import { EraserService } from './eraser-service';
import { LineService } from './line-service';
import { RectangleService } from './rectangle-service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService extends Tool {
    undoPile: UndoRedoPile[];
    redoPile: UndoRedoPile[];

    constructor(
        drawingService: DrawingService,
        private pencilService: PencilService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private lineService: LineService,
        private eraserService: EraserService,
        private brushService: BrushService,
    ) {
        super(drawingService);

        this.clearPile();
    }

    undo(): void {
        const lastIn = this.undoPile.pop();
        if (lastIn !== undefined) {
            this.redoPile.push(lastIn);
            this.draw();
        }
    }

    redo(): void {
        const lastIn = this.redoPile.pop();
        if (lastIn !== undefined) {
            this.undoPile.push(lastIn);
            this.draw();
        }
    }

    draw(): void {
        if (this.undoPile.length <= 0 || this.redoPile.length <= 0) {
            console.log('tes');
            return;
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (var i = 0; i < this.undoPile.length; i++) {
            const pt = this.undoPile[i];
            if (pt.id == 'line') {
                this.lineService.drawLine(this.drawingService.baseCtx);
            } else if (pt.id == 'brush') {
                this.brushService.drawBrush(this.drawingService.baseCtx, pt.path);
            } else if (pt.id == 'pencil') {
                this.pencilService.drawLine(this.drawingService.baseCtx, pt.path);
            } else if (pt.id == 'erase') {
                this.eraserService.eraseLine(this.drawingService.baseCtx, pt.path);
            } else if (pt.id == 'rectangle') {
                this.rectangleService.drawRectangle(this.drawingService.baseCtx);
            } else if (pt.id == 'ellipse') {
                this.ellipseService.drawEllipse(this.drawingService.baseCtx);
            }
        }
        console.log('this.undoPile', this.undoPile);
        console.log('this.redoPile', this.redoPile);
    }

    clearPile() {
        this.undoPile = [];
        this.redoPile = [];
    }
}
