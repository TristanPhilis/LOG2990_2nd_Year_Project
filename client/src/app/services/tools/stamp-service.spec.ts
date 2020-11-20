import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ANGLE_ROTATION, ROTATION_COMPLETE } from '@app/shared/constant';
import { StampService } from './stamp-service';

// tslint:disable:no-any
describe('StampService', () => {
    let service: StampService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let mouseEvent: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let mouseEventLClick: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSpy: jasmine.Spy<any>;
    let saveActionSpy: jasmine.Spy<any>;

    beforeEach(() => {
        const defaultColor = new Color(0, 0, 0);
        colorServiceSpy = jasmine.createSpyObj('colorServiceSpy', ['']);
        colorServiceSpy.primaryColor = defaultColor;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorSelectionService, useValue: colorServiceSpy },
            ],
        });
        service = TestBed.inject(StampService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        saveActionSpy = spyOn<any>(service.action, 'next');

        // Service's Spy configuration
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mousePosition to correct position and draw the stamp if left click', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLClick);
        expect(service.mousePosition).toEqual(expectedResult);
        expect(drawSpy).toHaveBeenCalled();
    });

    it(' mouseDown should do nothing if right click', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventRClick);
        expect(service.mousePosition).not.toEqual(expectedResult);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should save action if mouse was already down', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(saveActionSpy).toHaveBeenCalled();
    });

    it(' mouseMove should set mousePosition to correct position and draw the stamp if we move the mouse', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseMove(mouseEvent);
        expect(service.mousePosition).toEqual(expectedResult);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('Using the mouseWheel should change the angle by 15 degrees', () => {
        const startAngle = service.stampAngle;
        const wheelEvent = {
            deltaY: 1,
            altKey: false,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        expect(service.stampAngle).toEqual(startAngle + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });

    it('Using the mouseWheel should change the angle by 1 degrees if alt key was pressed', () => {
        const startAngle = service.stampAngle;
        const wheelEvent = {
            deltaY: 1,
            altKey: true,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        expect(service.stampAngle).toEqual(startAngle + 1);
    });

    it('Using the mouseWheel should change the angle by 15 degrees but if stampAngle becomes bigger then 360 then 360 should be substracted', () => {
        service.stampAngle = ROTATION_COMPLETE;
        const startAngle = service.stampAngle;
        const wheelEvent = {
            deltaY: 1,
            altKey: false,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        expect(service.stampAngle).toEqual(startAngle - ROTATION_COMPLETE + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });

    it('Using the mouseWheel should change the angle by 15 degrees but if stampAngle becomes smaller then 0 then 360 should be added', () => {
        service.stampAngle = -ANGLE_ROTATION;
        const startAngle = service.stampAngle;
        const wheelEvent = {
            deltaY: -1,
            altKey: false,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        expect(service.stampAngle).toEqual(startAngle + ROTATION_COMPLETE + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });
});
