import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { UndoRedoPile, Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService extends Tool {
    pathData: Vec2[];
    undoPile: UndoRedoPile[];
    redoPile: UndoRedoPile[];
    points: [];

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPile();
    }

    undo(): void {
        const lastIn = this.undoPile.pop();
        console.log(this.undoPile);
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
        if (this.undoPile.length == 0 || this.redoPile.length == 0) {
            return;
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        for (var i = 0; i < this.undoPile.length; i++) {
            const pt = this.undoPile[i];
            if (pt.id == 'line') {
                this.onMouseDoubleClick(pt);
            }
        }
    }

    clearPile() {
        this.undoPile = [];
        this.redoPile = [];
    }
}
