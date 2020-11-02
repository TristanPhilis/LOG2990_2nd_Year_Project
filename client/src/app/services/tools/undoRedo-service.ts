import { Injectable } from '@angular/core';
import { UndoRedoPile } from '@app/classes/pile';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil-service';
import { drawingToolId } from '@app/shared/enum';
import { BrushService } from './brush.service';
import { EllipseService } from './ellipse-service';
import { EraserService } from './eraser-service';
import { LineService } from './line-service';
import { RectangleService } from './rectangle-service';
// import { ToolsService } from './tools-service';

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
    ) // private toolsService: ToolsService,
    {
        super(drawingService);

        this.clearPile();
    }

    undo(): void {
        const lastIn = this.undoPile.pop();
        if (lastIn !== undefined) {
            this.redoPile.push(lastIn);

            if (this.undoPile.length < 0) {
                return;
            }
            this.drawingService.clearCanvas(this.drawingService.baseCtx); ///
            for (var i = 0; i < this.undoPile.length; i++) {
                const pt = this.undoPile[i];
                // this.toolsService.currentDrawingTool.draw(this.drawingService.baseCtx, pt.path);
                switch (pt.id) {
                    case drawingToolId.lineService: {
                        this.lineService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.pencilService: {
                        this.pencilService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.brushService: {
                        this.brushService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.eraserService: {
                        this.eraserService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.rectangleService: {
                        this.rectangleService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.ellipseService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                }
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
            for (var i = 0; i < this.undoPile.length; i++) {
                const pt = this.undoPile[i];
                // this.toolsService.currentDrawingTool.draw(this.drawingService.baseCtx, pt.path);
                switch (pt.id) {
                    case drawingToolId.lineService: {
                        this.lineService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.brushService: {
                        this.brushService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.pencilService: {
                        this.pencilService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.eraserService: {
                        this.eraserService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.rectangleService: {
                        this.rectangleService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                    case drawingToolId.ellipseService: {
                        this.ellipseService.draw(this.drawingService.baseCtx, pt.path);
                        break;
                    }
                }
            }
        }
    }

    clearPile() {
        this.undoPile = [];
        this.redoPile = [];
    }
}
