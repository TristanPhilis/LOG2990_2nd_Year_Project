import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';

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

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;

    @Input()
    private canvasSize: Vec2;

    @Input()
    private workzoneRect: DOMRect;

    constructor(public drawingService: DrawingService, private toolsService: ToolsService) {}

    ngAfterViewInit(): void {
        this.selectionCanvas;
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.selectionCtx = this.selectionCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.fillCanvas('white');
    }

    ngOnChanges(changes: SimpleChanges): void {
        const canvasSizeKey = 'canvasSize';
        const workzoneRectKey = 'workzoneRect';
        const canvasChange = changes[canvasSizeKey];
        const workzoneChange = changes[workzoneRectKey];

        if (canvasChange && !canvasChange.firstChange) {
            this.resizeCanvas();
        }

        if (workzoneChange && !workzoneChange.firstChange) {
            this.setSelectionCanvasSize();
        }
    }

    setSelectionCanvasSize(): void {
        this.selectionCanvas.nativeElement.width = this.workzoneRect.width;
        this.selectionCanvas.nativeElement.height = this.workzoneRect.height;
    }

    resizeCanvas(): void {
        const savedImageData = this.drawingService.getImageData();
        this.baseCanvas.nativeElement.width = this.width;
        this.baseCanvas.nativeElement.height = this.height;
        this.previewCanvas.nativeElement.width = this.width;
        this.previewCanvas.nativeElement.height = this.height;
        this.gridCanvas.nativeElement.width = this.width;
        this.gridCanvas.nativeElement.height = this.height;
        this.drawingService.fillCanvas('white');
        this.drawingService.setImageData(savedImageData);
    }

    @HostListener('contextmenu', ['$event'])
    disableContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.currentTool.onMouseDown(event);
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.currentTool.onMouseUp(event);
    }

    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent): void {
        this.currentTool.onMouseClick(event);
    }

    @HostListener('dblclick', ['$event'])
    onMouseDoubleClick(event: MouseEvent): void {
        this.currentTool.onMouseDoubleClick(event);
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.currentTool.onKeyDown(event);
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get currentTool(): Tool {
        return this.toolsService.currentDrawingTool;
    }
}
