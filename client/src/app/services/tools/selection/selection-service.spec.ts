import { TestBed } from '@angular/core/testing';
import { SelectionService } from './selection-service';

describe('SelectionService', () => {
    let service: SelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

// import { TestBed } from '@angular/core/testing';
// import { canvasTestHelper } from '@app/classes/canvas-test-helper';
// import { Color } from '@app/classes/color';
// import { Vec2 } from '@app/classes/vec2';
// import { ColorSelectionService } from '@app/services/color/color-selection-service';
// import { DrawingService } from '@app/services/drawing/drawing.service';
// import { UndoRedoService } from '@app/services/tools/undo-redo-service';
// import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ESCAPE_KEY, SHIFT_KEY } from '@app/shared/constant';
// import { RectangleSelectorService } from './rectangle-selector-service';

// // tslint:disable:no-any
// describe('RectangleSelectorService', () => {
//     let service: RectangleSelectorService;
//     let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
//     let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
//     let mouseEventLClick: MouseEvent;
//     let mouseEventRClick: MouseEvent;
//     let drawServiceSpy: jasmine.SpyObj<DrawingService>;

//     let baseCtxStub: CanvasRenderingContext2D;
//     let previewCtxStub: CanvasRenderingContext2D;
//     let initializeSelectedBoxSpy: jasmine.Spy<any>;
//     let drawSelectionBoxSpy: jasmine.Spy<any>;
//     let placeImageSpy: jasmine.Spy<any>;
//     let updateSelectedAreaPreviewSpy: jasmine.Spy<any>;

//     let initializeSelectionBoxSpy: jasmine.Spy<any>;

//     let putImageDataSpy: jasmine.Spy<any>;

//     beforeEach(() => {
//         undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['saveAction']);
//         const defaultColor = new Color(0, 0, 0);
//         colorServiceSpy = jasmine.createSpyObj('colorServiceSpy', ['']);
//         colorServiceSpy.primaryColor = defaultColor;
//         colorServiceSpy.secondaryColor = defaultColor;
//         baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
//         previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
//         drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'fillCanvasAtLocation']);

//         TestBed.configureTestingModule({
//             providers: [
//                 { provide: DrawingService, useValue: drawServiceSpy },
//                 { provide: UndoRedoService, useValue: undoRedoServiceSpy },
//                 { provide: ColorSelectionService, useValue: colorServiceSpy },
//             ],
//         });
//         service = TestBed.inject(RectangleSelectorService);
//         initializeSelectedBoxSpy = spyOn<any>(service, 'initializeSelectedBox').and.callThrough();
//         placeImageSpy = spyOn<any>(service, 'placeImage').and.callThrough();
//         // Service's Spy configuration
//         // tslint:disable:no-string-literal
//         service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
//         service['drawingService'].previewCtx = previewCtxStub;

//         mouseEventLClick = {
//             offsetX: 25,
//             offsetY: 25,
//             buttons: 1,
//         } as MouseEvent;

//         mouseEventRClick = {
//             offsetX: 25,
//             offsetY: 25,
//             buttons: 2,
//         } as MouseEvent;
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it(' mouseDown should call initializeCurrentCoord to correct position if no area has been selected', () => {
//         initializeSelectionBoxSpy = spyOn<any>(service, 'initializeSelectionBox').and.callThrough();
//         const expectedResult: Vec2 = { x: 25, y: 25 };
//         service.onMouseDown(mouseEventLClick);
//         expect(initializeSelectionBoxSpy).toHaveBeenCalledWith(expectedResult);
//     });

//     it(' mouseDown should set mouseDown property to true on left click', () => {
//         service.onMouseDown(mouseEventLClick);
//         expect(service.mouseDown).toEqual(true);
//     });

//     it(' mouseDown should set mouseDown property to false on right click', () => {
//         service.onMouseDown(mouseEventRClick);
//         expect(service.mouseDown).toEqual(false);
//     });

//     it(' mouseDown should call initializeSelectionBox when area has been selected and you click outside of the area', () => {
//         initializeSelectionBoxSpy = spyOn<any>(service, 'initializeSelectionBox').and.callThrough();
//         service.isAreaSelected = true;
//         service.mouseDown = true;
//         spyOn(service.selectedBox, 'isInBox').and.returnValue(false);
//         spyOn<any>(baseCtxStub, 'putImageData');
//         service.onMouseDown(mouseEventLClick);
//         expect(initializeSelectionBoxSpy).toHaveBeenCalled();
//     });

//     it(' mouseDown should change draggingAnchorRelativePosition when area has been selected and you click inside of the selected area', () => {
//         service.isAreaSelected = true;
//         service.mouseDown = true;
//         const temp = service.draggingAnchorRelativePosition;
//         spyOn(service.selectedBox, 'isInBox').and.returnValue(true);
//         service.onMouseDown(mouseEventLClick);
//         expect(service.draggingAnchorRelativePosition).not.toEqual(temp);
//     });

//     it(' onMouseUp should call initializeSelectedBox if mouse was already down and isAreaSelected is false', () => {
//         service.mouseDown = true;
//         service.onMouseDown(mouseEventLClick);
//         service.isAreaSelected = false;
//         service.onMouseUp(mouseEventLClick);
//         expect(initializeSelectedBoxSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should call drawSelectionBox if mouse was already down but nothing was selected', () => {
//         drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox');
//         service.isAreaSelected = false;
//         service.onMouseDown(mouseEventLClick);
//         service.onMouseMove(mouseEventLClick);
//         expect(drawSelectionBoxSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should draw selectionBox if mouse was already down but nothing was selected and shift was not down', () => {
//         service.selectionBox.setAnchor({ x: 4, y: 4 });
//         service.selectionBox.updateOpposingCorner({ x: 4, y: 4 });
//         service.mouseDown = true;
//         service.isAreaSelected = false;
//         service.shiftDown = false;
//         const rectSpy = spyOn<any>(drawServiceSpy.previewCtx, 'rect');
//         service.onMouseMove(mouseEventLClick);
//         expect(rectSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should draw selectionBox if mouse was already down but nothing was selected and shift was down', () => {
//         service.selectionBox.setAnchor({ x: 4, y: 4 });
//         service.selectionBox.updateOpposingCorner({ x: 4, y: 4 });
//         service.mouseDown = true;
//         service.isAreaSelected = false;
//         service.shiftDown = true;
//         const rectSpy = spyOn<any>(drawServiceSpy.previewCtx, 'rect');
//         service.onMouseMove(mouseEventLClick);
//         expect(rectSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should call initialize if mouse was already down (but not left click) and nothing was selected', () => {
//         spyOn<any>(service.selectedBox, 'updateFromSelectionBox');
//         service.isAreaSelected = false;
//         service.mouseDown = true;
//         service.onMouseMove(mouseEventRClick);
//         expect(initializeSelectedBoxSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should call updateSelectedAreaPreview if mouse was already down and was selected', () => {
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview');
//         service.isAreaSelected = true;
//         service.mouseDown = true;
//         const vector: Vec2 = { x: 25, y: 25 };
//         spyOn<any>(service, 'translateSelectedBoxFromMouseMove').withArgs(vector);
//         service.onMouseMove(mouseEventLClick);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it(' onMouseMove should call updateSelectedAreaPreview if mouse was already down and was selected', () => {
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview');
//         service.isAreaSelected = true;
//         service.mouseDown = true;
//         const vector: Vec2 = { x: 25, y: 25 };
//         spyOn<any>(service, 'translateSelectedBoxFromMouseMove').withArgs(vector);
//         service.onMouseMove(mouseEventLClick);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it(' placeImage should call putImageData if an area has been selected', () => {
//         putImageDataSpy = spyOn<any>(baseCtxStub, 'putImageData').and.callThrough();
//         service.isAreaSelected = false;
//         service.onMouseDown(mouseEventLClick);
//         service.onMouseMove(mouseEventLClick);
//         service.onMouseUp(mouseEventLClick);
//         service.isAreaSelected = true;
//         const size = 10;
//         service.selectedImageData = new ImageData(size, size);
//         service.placeImage();
//         expect(putImageDataSpy).toHaveBeenCalled();
//     });

//     it('onKeyDown Should call drawSelectionBox when shift key is and no area has been selected', () => {
//         drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox');
//         service.mouseDown = true;
//         service.isAreaSelected = false;
//         const keyEvent = {
//             key: SHIFT_KEY,
//         } as KeyboardEvent;
//         service.onKeyDown(keyEvent);
//         expect(drawSelectionBoxSpy).toHaveBeenCalled();
//     });

//     it('onKeyDown Should Update the selected Area Preview when Up Arrow is pressed', () => {
//         service.isAreaSelected = true;
//         service.keyMap[ARROW_UP] = true;
//         const keyEvent = {
//             key: 'ArrowUp',
//         } as KeyboardEvent;
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview').and.callThrough();
//         spyOn<any>(drawServiceSpy.previewCtx, 'putImageData');
//         service.onKeyDown(keyEvent);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it('onKeyDown Should Update the selected Area Preview when down Arrow is pressed', () => {
//         service.isAreaSelected = true;
//         service.keyMap[ARROW_DOWN] = true;
//         const keyEvent = {
//             key: 'ArrowDown',
//         } as KeyboardEvent;
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview').and.callThrough();
//         spyOn<any>(drawServiceSpy.previewCtx, 'putImageData');
//         service.onKeyDown(keyEvent);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it('onKeyDown Should Update the selected Area Preview when right Arrow is pressed', () => {
//         service.isAreaSelected = true;
//         service.keyMap[ARROW_RIGHT] = true;
//         const keyEvent = {
//             key: 'ArrowRight',
//         } as KeyboardEvent;
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview').and.callThrough();
//         spyOn<any>(drawServiceSpy.previewCtx, 'putImageData');
//         service.onKeyDown(keyEvent);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it('onKeyDown Should Update the selected Area Preview when left Arrow is pressed', () => {
//         service.isAreaSelected = true;
//         service.keyMap[ARROW_LEFT] = true;
//         const keyEvent = {
//             key: 'ArrowLeft',
//         } as KeyboardEvent;
//         updateSelectedAreaPreviewSpy = spyOn<any>(service, 'updateSelectedAreaPreview').and.callThrough();
//         spyOn<any>(drawServiceSpy.previewCtx, 'putImageData');
//         service.onKeyDown(keyEvent);
//         expect(updateSelectedAreaPreviewSpy).toHaveBeenCalled();
//     });

//     it('onKeyUp upShould call placeImage  when escape is released and mouse is down', () => {
//         service.onMouseDown(mouseEventLClick);
//         const keyEvent = {
//             key: ESCAPE_KEY,
//         } as KeyboardEvent;

//         service.onKeyUp(keyEvent);
//         expect(placeImageSpy).toHaveBeenCalled();
//     });

//     it('onKeyUp upShould call placeImage  when escape is released and mouse is down', () => {
//         drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox');
//         service.mouseDown = true;
//         service.isAreaSelected = false;
//         const keyEvent = {
//             key: SHIFT_KEY,
//         } as KeyboardEvent;

//         service.onKeyUp(keyEvent);
//         expect(drawSelectionBoxSpy).toHaveBeenCalled();
//     });

//     it('Pressing a key other then the correct ones shound not do anything', () => {
//         drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox');
//         const keyEvent = {
//             key: 'Alt',
//         } as KeyboardEvent;

//         service.onKeyDown(keyEvent);
//         service.onKeyUp(keyEvent);
//         expect(drawSelectionBoxSpy).not.toHaveBeenCalled();
//         expect(placeImageSpy).not.toHaveBeenCalled();
//     });
// });
