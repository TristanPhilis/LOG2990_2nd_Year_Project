import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { AnchorsPosition, DrawingToolId, MouseButton } from '@app/shared/enum';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnChanges {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('selectionCanvas', { static: false }) selectionCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('bottomAnchor', { static: false }) bottomAnchor: ElementRef<HTMLDivElement>;
    @ViewChild('rightAnchor', { static: false }) rightAnchor: ElementRef<HTMLDivElement>;
    @ViewChild('cornerAnchor', { static: false }) cornerAnchor: ElementRef<HTMLDivElement>;

    isResizing: boolean;

    @Input()
    private workzoneSize: Vec2;

    constructor(public drawingService: DrawingService, private toolsService: ToolsService, private canvasSizeService: CanvasSizeService) {}

    ngAfterViewInit(): void {
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;
        this.drawingService.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.drawingService.selectionCtx = this.selectionCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.selectionCanvas = this.selectionCanvas.nativeElement;

        this.canvasSizeService.bottomAnchor = this.bottomAnchor.nativeElement;
        this.canvasSizeService.cornerAnchor = this.cornerAnchor.nativeElement;
        this.canvasSizeService.rightAnchor = this.rightAnchor.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const workzoneSizeKey = 'workzoneSize';
        const workzoneChange = changes[workzoneSizeKey];

        if (workzoneChange && !workzoneChange.firstChange) {
            this.canvasSizeService.setInitialCanvasSize(this.workzoneSize.x, this.workzoneSize.y);
        }
    }

    onAnchorPressed(event: MouseEvent, anchor: AnchorsPosition): void {
        if (event.buttons !== MouseButton.Left) {
            return;
        }
        this.isResizing = true;
        this.canvasSizeService.initializeResizing(anchor);
    }

    @HostListener('contextmenu', ['$event'])
    disableContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.isResizing) {
            this.canvasSizeService.onMouseMove(event);
        } else {
            this.currentTool.onMouseMove(event);
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (this.drawingService.mouseIsOverCanvas || this.toolsService.currentDrawingToolID === DrawingToolId.selectionService) {
            this.currentTool.onMouseDown(event);
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.isResizing) {
            this.canvasSizeService.onMouseUp(event);
            this.isResizing = false;
        } else {
            this.currentTool.onMouseUp(event);
        }
    }

    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent): void {
        if (this.drawingService.mouseIsOverCanvas) {
            this.currentTool.onMouseClick(event);
        }
    }

    @HostListener('dblclick', ['$event'])
    onMouseDoubleClick(event: MouseEvent): void {
        if (this.drawingService.mouseIsOverCanvas) {
            this.currentTool.onMouseDoubleClick(event);
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.currentTool.onKeyDown(event);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }

    @HostListener('mousewheel', ['$event'])
    onMouseWheel(event: WheelEvent): void {
        this.currentTool.onWheel(event);
    }

    get AnchorsPosition(): typeof AnchorsPosition {
        return AnchorsPosition;
    }

    get previewSize(): Vec2 {
        return this.canvasSizeService.previewSize;
    }

    get currentTool(): Tool {
        return this.toolsService.currentDrawingTool;
    }
}
