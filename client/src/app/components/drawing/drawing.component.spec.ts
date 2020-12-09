import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { CanvasSizeService } from '@app/services/drawing/canvas-size-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { AnchorsPosition, MouseButton } from '@app/shared/enum';
import { DrawingComponent } from './drawing.component';

import SpyObj = jasmine.SpyObj;

class ToolStub extends Tool {}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let toolsServiceSpy: SpyObj<ToolsService>;
    let canvasSizeServiceSpy: SpyObj<CanvasSizeService>;

    beforeEach(
        waitForAsync(() => {
            toolStub = new ToolStub({} as DrawingService, {} as ColorSelectionService);
            drawServiceSpy = jasmine.createSpyObj('DrawingService', ['']);
            toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['']);
            canvasSizeServiceSpy = jasmine.createSpyObj('CanvasSizeService', [
                'onMouseUp',
                'onMouseMove',
                'initializeResizing',
                'setInitialCanvasSize',
            ]);
            toolsServiceSpy.currentDrawingTool = toolStub;
            TestBed.configureTestingModule({
                declarations: [DrawingComponent],
                providers: [
                    { provide: ToolsService, useValue: toolsServiceSpy },
                    { provide: DrawingService, useValue: drawServiceSpy },
                    { provide: CanvasSizeService, useValue: canvasSizeServiceSpy },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get the current tool', () => {
        const currentDrawingTool = component.currentTool;
        expect(currentDrawingTool).toEqual(toolsServiceSpy.currentDrawingTool);
    });

    it('should do nothing if anchor is pressed without left click', () => {
        const invalidClick = { buttons: MouseButton.Right } as MouseEvent;
        component.onAnchorPressed(invalidClick, AnchorsPosition.topLeft);
        expect(component.isResizing).toBeFalse();
    });

    it('should initialize resizing if left click on anchor', () => {
        const leftClick = { buttons: MouseButton.Left } as MouseEvent;
        component.onAnchorPressed(leftClick, AnchorsPosition.topLeft);
        expect(component.isResizing).toBeTrue();
        expect(canvasSizeServiceSpy.initializeResizing).toHaveBeenCalled();
    });

    it('disableContextMenu should call prevent default on context menu mouse event', () => {
        const eventSpyObj = jasmine.createSpyObj('MouseEvent', ['preventDefault']);
        component.disableContextMenu(eventSpyObj);
        expect(eventSpyObj.preventDefault).toHaveBeenCalled();
    });

    it(" should call the tool's mouse move when receiving a mouse move event and not currently resizing", () => {
        component.isResizing = false;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' should call the canvasSize service mouse move when receiving a mouse move event and currently resizing', () => {
        component.isResizing = true;
        const event = {} as MouseEvent;
        component.onMouseMove(event);
        expect(canvasSizeServiceSpy.onMouseMove).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouse down when mouse is outside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = false;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouse down when mouse is inside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = true;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's mouse up when receiving a mouse up event and not currently resizing", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(' should call the canvasSize service mouse up when receiving a mouse up event and currently resizing', () => {
        component.isResizing = true;
        const event = {} as MouseEvent;
        component.onMouseUp(event);
        expect(canvasSizeServiceSpy.onMouseUp).toHaveBeenCalledWith(event);
        expect(component.isResizing).toBeFalse();
    });

    it(" should call the tool's mouse click when mouse is inside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = true;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseClick').and.callThrough();
        component.onMouseClick(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouse click when mouse is outside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = false;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseClick').and.callThrough();
        component.onMouseClick(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's mouse double click when mouse is inside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = true;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseDoubleClick').and.callThrough();
        component.onMouseDoubleClick(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should not call the tool's mouse double click when mouse is outside of canvas", () => {
        drawServiceSpy.mouseIsOverCanvas = false;
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseDoubleClick').and.callThrough();
        component.onMouseDoubleClick(event);
        expect(mouseEventSpy).not.toHaveBeenCalled();
    });

    it(" should call the tool's key down when receiving a key down event", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onKeyDown').and.callThrough();
        component.onKeyDown(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it(" should call the tool's key up when receiving a key up event", () => {
        const event = {} as KeyboardEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onKeyUp').and.callThrough();
        component.onKeyUp(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it('should call the tool onWheel when receiving an onWheel event', () => {
        const event = {} as WheelEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onWheel').and.callThrough();
        component.onMouseWheel(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    it('AnchorsPosition getter should return the enum Type', () => {
        expect(component.AnchorsPosition).toEqual(AnchorsPosition);
    });

    it('previewSize getter should return the canvasSize service previewSize', () => {
        canvasSizeServiceSpy.previewSize = { x: 2, y: 2 };
        expect(component.previewSize).toEqual(canvasSizeServiceSpy.previewSize);
    });

    it('on the first workzone size change, should do nothing', () => {
        const changes = { workzoneSize: { firstChange: true } as SimpleChange } as SimpleChanges;
        component.ngOnChanges(changes);
        expect(canvasSizeServiceSpy.setInitialCanvasSize).not.toHaveBeenCalled();
    });

    it('on the second workzone size change, should initialize hte canvas size', () => {
        // tslint:disable-next-line:no-string-literal
        component['workzoneSize'] = {} as Vec2;
        const changes = { workzoneSize: { firstChange: false } as SimpleChange } as SimpleChanges;
        component.ngOnChanges(changes);
        expect(canvasSizeServiceSpy.setInitialCanvasSize).toHaveBeenCalled();
    });
});
