import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { EllipseService } from '@app/services/tools/ellipse-service';
import { EraserService } from '@app/services/tools/eraser-service';
import { LineService } from '@app/services/tools/line-service';
import { PencilService } from '@app/services/tools/pencil-service';
import { RectangleService } from '@app/services/tools/rectangle-service';
import { ToolId } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class ToolsService {
    currentTool: Tool;
    private tools: Tool[];
    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        eraserService: EraserService,
        lineService: LineService,
    ) {
        this.currentTool = pencilService;
        this.tools = [pencilService, rectangleService, ellipseService, eraserService, lineService];
    }

    setCurrentTool(toolId: ToolId): void {
        this.currentTool = this.tools[toolId];
    }
}
