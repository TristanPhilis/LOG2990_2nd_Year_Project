import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolsService } from '@app/services/tools/tools-service';
import { DrawingComponent } from './drawing.component';

import SpyObj = jasmine.SpyObj;

class ToolStub extends Tool {}

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let toolsServiceSpy: SpyObj<ToolsService>;

    beforeEach(
        waitForAsync(() => {
            toolStub = new ToolStub({} as DrawingService, {} as ColorSelectionService);
            drawServiceSpy = jasmine.createSpyObj('DrawingService', ['']);
            toolsServiceSpy = jasmine.createSpyObj('ToolsService', ['']);
            toolsServiceSpy.currentDrawingTool = toolStub;
            TestBed.configureTestingModule({
                declarations: [DrawingComponent],
                providers: [
                    { provide: ToolsService, useValue: toolsServiceSpy },
                    { provide: DrawingService, useValue: drawServiceSpy },
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

    it(" should call the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
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

    it(" should call the tool's mouse up when receiving a mouse up event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(toolsServiceSpy.currentDrawingTool, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
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
});
