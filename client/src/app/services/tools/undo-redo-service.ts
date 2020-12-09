import { Injectable, OnDestroy } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { ResizeAction } from '@app/classes/resize-action';
import { SelectionAction } from '@app/classes/selection-action';
import { Tool } from '@app/classes/tool';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { Subscription } from 'rxjs';

export type Action = DrawingAction | ResizeAction | SelectionAction;

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService implements OnDestroy {
    undoPile: Action[];
    redoPile: Action[];
    undidAction: boolean;
    resizeActionIndexes: number[];
    private subscriptions: Subscription;

    constructor(private drawingService: DrawingService, private canvasResizeService: CanvasSizeService, private toolsService: ToolsService) {
        this.subscriptions = new Subscription();
        this.clearPile();
        this.undidAction = false;
        this.subscribeToToolsActions();
        this.subscriptions.add(
            this.canvasResizeService.action.subscribe((action: Action) => {
                this.saveAction(action);
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private subscribeToToolsActions(): void {
        this.toolsService.getTools().forEach((tool: Tool) => {
            this.subscriptions.add(
                tool.action.subscribe((action: Action) => {
                    this.saveAction(action);
                }),
            );
        });
    }

    saveAction(action: Action): void {
        this.undoPile.push(action);
        if (this.isResizeAction(action)) {
            this.resizeActionIndexes.push(this.undoPile.length - 1);
        }
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
            if (this.isResizeAction(lastIn)) {
                this.resizeActionIndexes.pop();
                this.processResizeAction(lastIn, true);
            } else {
                this.drawingService.fillCanvas('white');
                let startIndex = 0;
                // Redraw the canvas from the most recent resize action
                if (this.resizeActionIndexes.length > 0) {
                    const resizeActionIndex = this.resizeActionIndexes[this.resizeActionIndexes.length - 1];
                    startIndex = resizeActionIndex + 1;
                    this.processResizeAction(this.undoPile[resizeActionIndex], false);
                }
                for (let i = startIndex; i < this.undoPile.length; i++) {
                    const drawingAction = this.undoPile[i] as DrawingAction;
                    this.toolsService.getTool(drawingAction.id).draw(this.drawingService.baseCtx, drawingAction);
                }
            }
        }
    }

    redo(): void {
        const lastIn = this.redoPile.pop();
        if (lastIn !== undefined) {
            this.undoPile.push(lastIn);
            if (this.isResizeAction(lastIn)) {
                this.resizeActionIndexes.push(this.undoPile.length - 1);
                this.processResizeAction(lastIn, false);
            } else {
                const action = this.isDrawingAction(lastIn) ? (lastIn as DrawingAction) : (lastIn as SelectionAction);
                this.toolsService.getTool(action.id).draw(this.drawingService.baseCtx, action);
            }
        }
    }

    clearPile(): void {
        this.undoPile = [];
        this.redoPile = [];
        this.resizeActionIndexes = [];
    }

    private isResizeAction(action: Action): boolean {
        return !('id' in action);
    }

    private isDrawingAction(action: Action): boolean {
        return !('selectedBox' in action);
    }

    private processResizeAction(action: Action, useOldSize: boolean): void {
        action = action as ResizeAction;
        const size = useOldSize ? action.oldSize : action.newSize;
        this.canvasResizeService.completeResize(size, action.imageData);
    }
}
