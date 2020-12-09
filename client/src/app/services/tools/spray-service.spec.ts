/* tslint:disable:no-unused-variable */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayService } from './spray-service';

// tslint:disable:no-any
describe('SprayService', () => {
    let service: SprayService;
    let mouseEvent: MouseEvent;
    const timer = 1001;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let saveActionSpy: jasmine.Spy<any>;
    let drawSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(SprayService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();
        saveActionSpy = spyOn<any>(service.action, 'next');
        const contextMethod = ['stroke', 'fill', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'setLineDash', 'arc'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should do nothing if onMouseDown is triggerred with an other button then left click', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 0, y: 0 });
        const wrongEvent = { buttons: 0 } as MouseEvent;
        service.onMouseDown(wrongEvent);
        expect(positionSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should have called getPositionFromMouse() and startSpray', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const startSpraySpy = spyOn<any>(service, 'startSpray');
        service.onMouseDown(mouseEvent);
        expect(positionSpy).toHaveBeenCalled();
        expect(startSpraySpy).toHaveBeenCalled();
    });

    it('onMouseMove should have call getPositionFromMouse()', () => {
        const positionSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        service.onMouseMove(mouseEvent);
        expect(positionSpy).toHaveBeenCalled();
    });

    it('onMouseUp should do nothing if mouse was not down', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(saveActionSpy).not.toHaveBeenCalled();
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call draw and saveAction if mouse was down ', () => {
        service.mouseDown = true;
        jasmine.clock().install();
        service.onMouseUp(mouseEvent);
        jasmine.clock().tick(timer);
        expect(saveActionSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('startSpray should call draw ', () => {
        service.mouseDownCoord = {} as Vec2;
        jasmine.clock().install();
        service.startSpray();
        jasmine.clock().tick(timer);
        expect(drawSpy).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
});
