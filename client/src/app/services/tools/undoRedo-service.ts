import { Injectable, Injector } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    undoPile: DrawingAction[];
    redoPile: DrawingAction[];
    undidAction: boolean;
    toolsService: ToolsService;

    constructor(private drawingService: DrawingService, injector: Injector) {
        this.clearPile();
        this.undidAction = false;
        setTimeout(() => {
            this.toolsService = injector.get(ToolsService);
        });
    }

    saveAction(action: DrawingAction): void {
        this.undoPile.push(action);
        if (this.undidAction) {
            this.redoPile = [];
            this.undidAction = false;
        }
    }

    undo(): void {
        this.undidAction = true;
        const lastIn = this.undoPile.pop();
        if (lastIn !== undefined) {
            this.redoPile.push(lastIn);

            if (this.redoPile.length < 0 || this.undoPile.length < 0) {
                return;
            }
            this.drawingService.fillCanvas('white');
            for (const action of this.undoPile) {
                this.toolsService.getTool(action.id).draw(this.drawingService.baseCtx, action);
            }
        }
    }

    redo(): void {
        const lastIn = this.redoPile.pop();
        if (lastIn !== undefined) {
            this.undoPile.push(lastIn);
            if (this.redoPile.length < 0 || this.undoPile.length < 0) {
                return;
            }
            this.toolsService.getTool(lastIn.id).draw(this.drawingService.baseCtx, lastIn);
        }
    }

    clearPile(): void {
        this.undoPile = [];
        this.redoPile = [];
    }
}
