import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ANGLE_ROTATION, ROTATION_COMPLETE } from '@app/shared/constant';
import { Options } from '@app/shared/enum';
import { FeatherService } from './feather-service';

// tslint:disable:no-any
describe('Service: Feather', () => {
    let service: FeatherService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSpy: jasmine.Spy<any>;
    let saveActionSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(FeatherService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        saveActionSpy = spyOn<any>(service.action, 'next');
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Service's Spy configuration
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should not call draw if mouse is not down', () => {
        const wrongEvent = { buttons: 0 } as MouseEvent;
        service.onMouseDown(wrongEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' mouseDown should  call draw if mouse is  down', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('mouseUp should call action if mouse was already down', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(saveActionSpy).toHaveBeenCalled();
    });

    it('mouseMove should do nothing if he is triggerred with an other button than left click', () => {
        const wrongEvent = { buttons: 0 } as MouseEvent;
        service.onMouseMove(wrongEvent);
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it(' mouseMove should  call draw if mouse is  down and pathData greater than 2', () => {
        service.mouseDown = true;
        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        service.onMouseMove(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('mouseWheel should change the angle by 15 degrees if is betwen 0 and 360', () => {
        let startAngle = 0;
        let endAngle = 0;
        let angle = service.getDrawingAction().options.toolOptions.get(Options.angle);
        if (angle) {
            startAngle = angle.value;
        }
        const wheelEvent = {
            deltaY: 1,
            altKey: false,
        } as WheelEvent;
        service.onWheel(wheelEvent);
        angle = service.getDrawingAction().options.toolOptions.get(Options.angle);
        if (angle) {
            endAngle = angle.value;
        }
        expect(endAngle).toEqual(startAngle + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });

    it('mouseWheel should change the angle by 1 degrees if is betwen 0 and 360', () => {
        let startAngle = 0;
        let endAngle = 0;
        let angle = service.getDrawingAction().options.toolOptions.get(Options.angle);
        if (angle) {
            startAngle = angle.value;
        }
        const wheelEvent = {
            deltaY: 1,
            altKey: true,
        } as WheelEvent;
        service.onWheel(wheelEvent);
        angle = service.getDrawingAction().options.toolOptions.get(Options.angle);
        if (angle) {
            endAngle = angle.value;
        }
        expect(endAngle).toEqual(startAngle + Math.sign(wheelEvent.deltaY) * 1);
    });

    it('mouseWheel should change the angle by 15 degrees if is greater than 360', () => {
        let startAngle = 0;
        let endAngle = 0;
        // It's never gonna be null, need to do this to test
        // tslint:disable-next-line: no-non-null-assertion
        const angle = service.options.toolOptions.get(Options.angle)!;
        angle.value = ROTATION_COMPLETE;
        if (angle) {
            startAngle = angle.value;
        }
        const wheelEvent = {
            deltaY: 1,
            altKey: false,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        if (angle) {
            endAngle = angle.value;
        }
        expect(endAngle).toEqual(startAngle - ROTATION_COMPLETE + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });

    it('mouseWheel should change the angle by 15 degrees if is smaller than 0 ', () => {
        let startAngle = 0;
        let endAngle = 0;
        // It's never gonna be null, need to do this to test
        // tslint:disable-next-line: no-non-null-assertion
        const angle = service.options.toolOptions.get(Options.angle)!;
        angle.value = -ANGLE_ROTATION;
        if (angle) {
            startAngle = angle.value;
        }
        const wheelEvent = {
            deltaY: -1,
            altKey: false,
        } as WheelEvent;

        service.onWheel(wheelEvent);
        if (angle) {
            endAngle = angle.value;
        }
        expect(endAngle).toEqual(startAngle + ROTATION_COMPLETE + Math.sign(wheelEvent.deltaY) * ANGLE_ROTATION);
    });

    it('onWheel should call fillFromRotation if left click is triggered', () => {
        service.mouseDown = true;
        service['pathData'].push({ x: 0, y: 0 });
        service['pathData'].push({ x: 1, y: 1 });
        service['pathData'].push({ x: 2, y: 2 });
        const fillFromRotationSpy = spyOn<any>(service, 'fillFromRotation').and.callThrough();
        const wheelEvent = {
            deltaY: -1,
            altKey: false,
        } as WheelEvent;
        service.onWheel(wheelEvent);
        expect(fillFromRotationSpy).toHaveBeenCalled();
    });
});
