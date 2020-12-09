import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Selector } from '@app/classes/selector';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid-service';
import { KEYS } from '@app/shared/constant';
import { AnchorsPosition, MouseButton, Options, SelectionType } from '@app/shared/enum';
import { CanvasManipulationService } from '@app/utils/canvas-manipulation-service';
import { Subject } from 'rxjs';
import { HitboxDetectionService } from './hit-detection/hitbox-detection-service';
import { SelectionManipulationService } from './manipulation/selection-manipulation-service';
import { SelectionMouvementService } from './mouvement/selection-mouvement-service';
import { SelectionService } from './selection-service';
import { EllipseSelectorService } from './selector/ellipse-selector-service';
import { MagicSelectorService } from './selector/magic-selector-service';
import { RectangleSelectorService } from './selector/rectangle-selector-service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
// tslint:disable:max-file-line-count   can't test everything in 350 line when spy setups takes 100 lines
describe('SelectionService', () => {
    let service: SelectionService;

    let selectorSpy: jasmine.SpyObj<Selector>;
    let magicSelectorSpy: jasmine.SpyObj<MagicSelectorService>;
    let canvasUtilSpy: jasmine.SpyObj<CanvasManipulationService>;
    let mouvementServiceSpy: jasmine.SpyObj<SelectionMouvementService>;
    let hitboxDetectionServiceSpy: jasmine.SpyObj<HitboxDetectionService>;
    let manipulationServiceSpy: jasmine.SpyObj<SelectionManipulationService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let subjectSpyObj: jasmine.SpyObj<Subject<any>>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let selectionCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let leftClickEvent: MouseEvent;

    beforeEach(() => {
        selectorSpy = jasmine.createSpyObj('Selector', ['drawSelectionBox', 'copyArea', 'clearInitialSelectedZone']);
        selectorSpy.copyArea.and.returnValue({} as SelectionImageData);
        selectorSpy.id = SelectionType.rectangle;
        magicSelectorSpy = jasmine.createSpyObj('MagicSelectorService', [
            'drawSelectionBox',
            'copyArea',
            'clearInitialSelectedZone',
            'executeMagicSelection',
        ]);
        magicSelectorSpy.copyArea.and.returnValue({} as SelectionImageData);
        magicSelectorSpy.id = SelectionType.magic;
        canvasUtilSpy = jasmine.createSpyObj('CanvasManipulationService', ['applyRotation', 'applyMirrorScaling', 'getImageFromImageData']);
        canvasUtilSpy.getImageFromImageData.and.returnValue(new Image(1, 1));
        subjectSpyObj = jasmine.createSpyObj('Subject', ['subscribe']);
        mouvementServiceSpy = jasmine.createSpyObj('SelectionMouvementService', [
            'canProcessKey',
            'processMouseMouvement',
            'processKeyDown',
            'processKeyUp',
        ]);
        mouvementServiceSpy.onSelectedBoxMove = subjectSpyObj;
        hitboxDetectionServiceSpy = jasmine.createSpyObj('HitboxDetectionService', ['processMouseDown']);
        hitboxDetectionServiceSpy.onAnchorClicked = subjectSpyObj;
        hitboxDetectionServiceSpy.onSelectedBoxClicked = subjectSpyObj;
        manipulationServiceSpy = jasmine.createSpyObj('SelectionManipulationService', [
            'adjustPositionToNewCenter',
            'processAnchorMouvement',
            'initializeAnchorMouvement',
            'processWheelMouvement',
        ]);
        manipulationServiceSpy.onSelectedBoxChange = subjectSpyObj;
        gridServiceSpy = jasmine.createSpyObj('GridService', ['canProcessKey', 'processMouseMouvement', 'processKeyDown']);
        gridServiceSpy.onMagnetismStateChange = subjectSpyObj;
        const contextMethod = ['stroke', 'fill', 'beginPath', 'setLineDash', 'getImageData', 'rect', 'drawImage', 'resetTransform'];
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        selectionCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', contextMethod);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        colorServiceSpy = jasmine.createSpyObj('ColorSelectionService', ['']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleSelectorService, useValue: selectorSpy },
                { provide: EllipseSelectorService, useValue: selectorSpy },
                { provide: MagicSelectorService, useValue: magicSelectorSpy },
                { provide: GridService, useValue: gridServiceSpy },
                { provide: ColorSelectionService, useValue: colorServiceSpy },
                { provide: SelectionManipulationService, useValue: manipulationServiceSpy },
                { provide: HitboxDetectionService, useValue: hitboxDetectionServiceSpy },
                { provide: SelectionMouvementService, useValue: mouvementServiceSpy },
                { provide: CanvasManipulationService, useValue: canvasUtilSpy },
            ],
        });
        service = TestBed.inject(SelectionService);
        service['drawingService'].baseCtx = baseCtxSpy;
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].selectionCtx = selectionCtxSpy;
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service.selectionImageData = {} as SelectionImageData;

        leftClickEvent = { buttons: MouseButton.Left, offsetX: 25, offsetY: 25 } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onOptionValueChange should update the current selector', () => {
        service.options.toolOptions.set(Options.selectionType, { value: SelectionType.magic } as ToolOption);
        expect(service['currentSelector']).toBe(service['rectangleSelector']);
        (service as any).onOptionValueChange();
        expect(service['currentSelector']).toBe(service['magicSelector']);
    });

    it('onMouseDown should return if not a left or right click', () => {
        const getPosSpy = spyOn(service, 'getPositionFromMouse');
        const invalidClick = { buttons: 0 } as MouseEvent;
        service.onMouseDown(invalidClick);
        expect(getPosSpy).not.toHaveBeenCalled();
    });

    it('when area selected, clicking outside the box should place the image and if not magicSelector, initialize new selection', () => {
        service.isAreaSelected = true;
        service['currentSelector'].id = SelectionType.rectangle;
        hitboxDetectionServiceSpy.processMouseDown.and.returnValue(false);
        const placeImageSpy = spyOn<any>(service, 'placeImage');
        const initSelectionSpy = spyOn<any>(service, 'initializeSelectionBox');
        service.onMouseDown(leftClickEvent);
        expect(placeImageSpy).toHaveBeenCalled();
        expect(initSelectionSpy).toHaveBeenCalled();
    });

    it('when area selected, clicking outside the box should place the image and if magicSelector, should not initialize new selection', () => {
        service.isAreaSelected = true;
        service['currentSelector'].id = SelectionType.magic;
        hitboxDetectionServiceSpy.processMouseDown.and.returnValue(false);
        const placeImageSpy = spyOn<any>(service, 'placeImage');
        const initSelectionSpy = spyOn<any>(service, 'initializeSelectionBox');
        service.onMouseDown(leftClickEvent);
        expect(placeImageSpy).toHaveBeenCalled();
        expect(initSelectionSpy).not.toHaveBeenCalled();
    });

    it('when area selected, clicking inside the box should not place the image', () => {
        service.isAreaSelected = true;
        hitboxDetectionServiceSpy.processMouseDown.and.returnValue(true);
        const placeImageSpy = spyOn<any>(service, 'placeImage');
        service.onMouseDown(leftClickEvent);
        expect(placeImageSpy).not.toHaveBeenCalled();
    });

    it('when no area selected and magic selector active should execute magic selection and initialize selectedArea', () => {
        service.isAreaSelected = false;
        service['currentSelector'].id = SelectionType.magic;
        const initSelectedAreaSpy = spyOn<any>(service, 'initializeSelectedArea');
        service.onMouseDown(leftClickEvent);
        expect(initSelectedAreaSpy).toHaveBeenCalled();
        expect(magicSelectorSpy.executeMagicSelection).toHaveBeenCalled();
    });

    it('when no area selected and left click without the magic selector active should init the selection', () => {
        service.isAreaSelected = false;
        const initSelectionSpy = spyOn<any>(service, 'initializeSelectionBox');
        service.onMouseDown(leftClickEvent);
        expect(initSelectionSpy).toHaveBeenCalled();
    });

    it('when no area selected and right click shoudl do nothing', () => {
        service.isAreaSelected = false;
        const initSelectionSpy = spyOn<any>(service, 'initializeSelectionBox');
        const rightClick = { buttons: MouseButton.Right } as MouseEvent;
        service.onMouseDown(rightClick);
        expect(initSelectionSpy).not.toHaveBeenCalled();
    });

    it('when area selected, with right click should do nothing', () => {
        service.isAreaSelected = true;
        const rightClick = { buttons: MouseButton.Right } as MouseEvent;
        service.onMouseDown(rightClick);
        expect(hitboxDetectionServiceSpy.processMouseDown).not.toHaveBeenCalled();
    });

    it('onMouseUp should return early if mouseDown is false', () => {
        service.mouseDown = false;
        const initSelectedAreaSpy = spyOn<any>(service, 'initializeSelectedArea');
        service.onMouseUp(leftClickEvent);
        expect(initSelectedAreaSpy).not.toHaveBeenCalled();
        expect(manipulationServiceSpy.adjustPositionToNewCenter).not.toHaveBeenCalled();
    });

    it('onMouseUp should initialize the selected area', () => {
        service.mouseDown = true;
        const initSelectedAreaSpy = spyOn<any>(service, 'initializeSelectedArea');
        service.onMouseUp(leftClickEvent);
        expect(initSelectedAreaSpy).toHaveBeenCalled();
    });

    it('onMouseUp should adjust the position of the selectedBox when an anchor was clicked', () => {
        service.mouseDown = true;
        service.isAreaSelected = true;
        service.isAnchorClicked = true;
        service.onMouseUp(leftClickEvent);
        expect(manipulationServiceSpy.adjustPositionToNewCenter).toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
        expect(service.isAnchorClicked).toBeFalse();
    });

    it('onMouseUp when area selected and not clicked on anchor should just set mouseDown to false', () => {
        service.isAreaSelected = true;
        service.mouseDown = true;
        service.isAnchorClicked = false;
        service.onMouseUp(leftClickEvent);
        expect(service.mouseDown).toBeFalse();
        expect(manipulationServiceSpy.adjustPositionToNewCenter).not.toHaveBeenCalled();
    });

    it('onMouseMove should return early if mouseDown is false', () => {
        const getPosSpy = spyOn(service, 'getPositionFromMouse');
        service.mouseDown = false;
        service.onMouseMove(leftClickEvent);
        expect(getPosSpy).not.toHaveBeenCalled();
    });

    it('if area selected and anchor clicked, should pocess the anchor mouvement', () => {
        service.mouseDown = true;
        service.isAreaSelected = true;
        service.isAnchorClicked = true;
        service.onMouseMove(leftClickEvent);
        expect(manipulationServiceSpy.processAnchorMouvement).toHaveBeenCalled();
    });

    it('if area selected and anchor not clicked, should pocess the box mouvement', () => {
        service.mouseDown = true;
        service.isAreaSelected = true;
        service.onMouseMove(leftClickEvent);
        expect(mouvementServiceSpy.processMouseMouvement).toHaveBeenCalled();
    });

    it('if area not selected and left click, should update the selection box', () => {
        service.mouseDown = true;
        service.isAreaSelected = false;
        service.onMouseMove(leftClickEvent);
        expect(selectorSpy.drawSelectionBox).toHaveBeenCalled();
    });

    it('if area not selected and not left click, should initialize the selected area', () => {
        service.mouseDown = true;
        service.isAreaSelected = false;
        const initSelectedAreaSpy = spyOn<any>(service, 'initializeSelectedArea');
        service.onMouseMove({} as MouseEvent);
        expect(initSelectedAreaSpy).toHaveBeenCalled();
    });

    it('onAnchorClicked should initialize manipulation service to process anchor mouvement', () => {
        (service as any).onAnchorClicked(AnchorsPosition.bottomLeft);
        expect(manipulationServiceSpy.initializeAnchorMouvement).toHaveBeenCalled();
    });

    it('onSelectedBoxClicked should update the selectedBox mouseCoord', () => {
        const newCoord = { x: 1, y: 1 };
        (service as any).onSelectedBoxClicked(newCoord);
        expect(service.selectedBox.mouseCoord).toEqual(newCoord);
    });

    it('pressing shift should call onShiftKeyEvent and set ShiftDown to true', () => {
        const shiftPress = { key: KEYS.SHIFT } as KeyboardEvent;
        const onShiftKeyEventSpy = spyOn<any>(service, 'onShiftKeyEvent');
        service.onKeyDown(shiftPress);
        expect(service.shiftDown).toBeTrue();
        expect(onShiftKeyEventSpy).toHaveBeenCalled();
    });

    it('when no area selected, arrow keys should not be processed', () => {
        const keyEvent = {} as KeyboardEvent;
        service.onKeyDown(keyEvent);
        expect(mouvementServiceSpy.processKeyDown).not.toHaveBeenCalled();
    });

    it('when area selected, arrow keys should be processed', () => {
        service.isAreaSelected = true;
        mouvementServiceSpy.canProcessKey.and.returnValue(true);
        const keyEvent = {
            key: KEYS.ARROW_DOWN,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service.onKeyDown(keyEvent);
        expect(mouvementServiceSpy.processKeyDown).toHaveBeenCalled();
    });

    it('releasing escape should place the selection', () => {
        const placeImageSpy = spyOn<any>(service, 'placeImage');
        const escapeKeyEvent = { key: KEYS.ESCAPE } as KeyboardEvent;
        service.onKeyUp(escapeKeyEvent);
        expect(placeImageSpy).toHaveBeenCalled();
    });

    it('releasing shift should call onShiftKeyEvent and set shiftdown to false ', () => {
        const shiftPress = { key: KEYS.SHIFT } as KeyboardEvent;
        const onShiftKeyEventSpy = spyOn<any>(service, 'onShiftKeyEvent');
        service.onKeyUp(shiftPress);
        expect(service.shiftDown).toBeFalse();
        expect(onShiftKeyEventSpy).toHaveBeenCalled();
    });

    it('releasing an arrow when area is selected should be processed', () => {
        service.isAreaSelected = true;
        mouvementServiceSpy.canProcessKey.and.returnValue(true);
        const keyEvent = { key: KEYS.ARROW_DOWN } as KeyboardEvent;
        service.onKeyUp(keyEvent);
        expect(mouvementServiceSpy.processKeyUp).toHaveBeenCalled();
    });

    it('onShiftKeyEvent should return early if mouse is not down', () => {
        (service as any).onShiftKeyEvent();
        expect(selectorSpy.drawSelectionBox).not.toHaveBeenCalled();
        expect(manipulationServiceSpy.processAnchorMouvement).not.toHaveBeenCalled();
    });

    it('onShiftKeyEvent should update the selection preview when no area selected', () => {
        service.mouseDown = true;
        (service as any).onShiftKeyEvent();
        expect(selectorSpy.drawSelectionBox).toHaveBeenCalled();
    });

    it('onShiftKeyEvent should update the anchor positions', () => {
        service.mouseDown = true;
        service.isAreaSelected = true;
        service.isAnchorClicked = true;
        (service as any).onShiftKeyEvent();
        expect(manipulationServiceSpy.processAnchorMouvement).toHaveBeenCalled();
    });

    it('inShiftKeyEvent when area is selected and clicking inside the box (not an anchor) should do nothing', () => {
        service.mouseDown = true;
        service.isAreaSelected = true;
        service.isAnchorClicked = false;
        (service as any).onShiftKeyEvent();
        expect(manipulationServiceSpy.processAnchorMouvement).not.toHaveBeenCalled();
    });

    it('onWheel should return early when no area selected', () => {
        service.onWheel({} as WheelEvent);
        expect(manipulationServiceSpy.processWheelMouvement).not.toHaveBeenCalled();
    });

    it('onWheel should increment of 1 when altKey is pressed', () => {
        service.isAreaSelected = true;
        service.onWheel({
            altKey: true,
            deltaY: 1,
            preventDefault: () => {
                return;
            },
        } as WheelEvent);
        expect(manipulationServiceSpy.processWheelMouvement).toHaveBeenCalledWith(service.selectedBox, 1);
    });

    it('onWheel should increment of 15 when altKey is pressed', () => {
        service.isAreaSelected = true;
        service.onWheel({
            altKey: false,
            deltaY: 1,
            preventDefault: () => {
                return;
            },
        } as WheelEvent);
        const expectedRotation = 15;
        expect(manipulationServiceSpy.processWheelMouvement).toHaveBeenCalledWith(service.selectedBox, expectedRotation);
    });

    it('initializing the selection should update the selectionBox corners', () => {
        const coord = { x: 1, y: 1 };
        (service as any).initializeSelectionBox(coord);
        expect(service['selectionBox'].position).toEqual(coord);
    });

    it('a selection box of width and height 0 should not initialize the selected area', () => {
        (service as any).initializeSelectedArea();
        expect(service.isAreaSelected).toBeFalse();
    });

    it('a valid selection without the magic selector should update the selectedBox and the selected area preview', () => {
        service['selectionBox'].updateOpposingCorner({ x: 1, y: 1 });
        const updateSelectedBoxSpy = spyOn(service.selectedBox, 'updateFromSelectionBox');
        const updateSelectedAreaSpy = spyOn(service, 'updateSelectedAreaPreview');
        (service as any).initializeSelectedArea();
        expect(updateSelectedBoxSpy).toHaveBeenCalled();
        expect(updateSelectedAreaSpy).toHaveBeenCalled();
    });

    it('a valid selection with the magic selector should not update the selectedBox', () => {
        service['selectionBox'].updateOpposingCorner({ x: 1, y: 1 });
        service['currentSelector'].id = SelectionType.magic;
        const updateSelectedBoxSpy = spyOn(service.selectedBox, 'updateFromSelectionBox');
        const updateSelectedAreaSpy = spyOn(service, 'updateSelectedAreaPreview');
        (service as any).initializeSelectedArea();
        expect(updateSelectedBoxSpy).not.toHaveBeenCalled();
        expect(updateSelectedAreaSpy).toHaveBeenCalled();
    });

    it('updateSelectedAreaPreview should work with the preview context', () => {
        service.updateSelectedAreaPreview();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxSpy);
    });

    it('placeImage should call draw on the base ctx if an area is selected', () => {
        const drawSpy = spyOn(service, 'draw');
        service.isAreaSelected = true;
        (service as any).placeImage();
        expect(drawSpy).toHaveBeenCalledWith(baseCtxSpy, service.getDrawingAction());
    });

    it('placeImage should not call draw if no area is selected', () => {
        const drawSpy = spyOn(service, 'draw');
        (service as any).placeImage();
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('selectAllCanvas should initialize the selected area with the canvas width and height', () => {
        const initSelectedAreaSpy = spyOn<any>(service, 'initializeSelectedArea');
        service.selectAllCanvas();
        expect(service['selectionBox'].width).toEqual(canvasTestHelper.canvas.width);
        expect(service['selectionBox'].height).toEqual(canvasTestHelper.canvas.height);
        expect(initSelectedAreaSpy).toHaveBeenCalled();
    });

    it('drawSelectedBox should work with the selection context, apply rotation and call drawAnchors', () => {
        const drawAnchorsSpy = spyOn<any>(service, 'drawAnchors');
        (service as any).drawSelectedBox();
        expect(selectionCtxSpy.stroke).toHaveBeenCalled();
        expect(drawAnchorsSpy).toHaveBeenCalled();
        expect(canvasUtilSpy.applyRotation).toHaveBeenCalled();
    });

    it('draw contours should return early if no contour to draw', () => {
        (service as any).drawContours();
        expect(previewCtxSpy.drawImage).not.toHaveBeenCalled();
    });

    it('if there is a contour, it should be drawn on the previewCtx with rotation and mirror scaling', () => {
        service.selectionImageData.contourImage = new Image(1, 1);
        (service as any).drawContours();
        expect(canvasUtilSpy.applyRotation).toHaveBeenCalled();
        expect(canvasUtilSpy.applyMirrorScaling).toHaveBeenCalled();
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
    });

    it('drawAnchors should draw 8 anchors on the selection context', () => {
        (service as any).drawAnchors();
        const expectedCalls = 8;
        expect(selectionCtxSpy.stroke).toHaveBeenCalledTimes(expectedCalls);
    });

    it('if magnetism is active and the selected anchor is not the center, should highlight the selectedAnchor', () => {
        gridServiceSpy.shouldSnapToGrid = true;
        gridServiceSpy.currentAnchor = AnchorsPosition.bottomLeft;
        (service as any).drawAnchors();
        const expectedCalls = 9;
        expect(selectionCtxSpy.stroke).toHaveBeenCalledTimes(expectedCalls);
    });

    it('draw should not call drawImage if there is no imageData', () => {
        service.draw(baseCtxSpy, service.getDrawingAction());
        expect(baseCtxSpy.drawImage).not.toHaveBeenCalled();
    });

    it('draw should call drawImage if there is an imageData', () => {
        service.selectionImageData.imageData = new ImageData(1, 1);
        service.draw(baseCtxSpy, service.getDrawingAction());
        expect(baseCtxSpy.drawImage).toHaveBeenCalled();
    });

    it('when receiving onAnchorClicked event, should call on anchor click', () => {
        hitboxDetectionServiceSpy.onAnchorClicked = new Subject<AnchorsPosition>();
        (service as any).subscribeToEvents();
        const onAnchorClickedSpy = spyOn<any>(service, 'onAnchorClicked');
        hitboxDetectionServiceSpy.onAnchorClicked.next();
        expect(onAnchorClickedSpy).toHaveBeenCalled();
    });

    it('when receiving onSelectedBoxClicked event, should call onSelectedBoxClicked', () => {
        hitboxDetectionServiceSpy.onSelectedBoxClicked = new Subject<Vec2>();
        (service as any).subscribeToEvents();
        const onSelectedBoxClickedSpy = spyOn<any>(service, 'onSelectedBoxClicked');
        hitboxDetectionServiceSpy.onSelectedBoxClicked.next();
        expect(onSelectedBoxClickedSpy).toHaveBeenCalled();
    });

    it('when receiving onMagnetismStateChange event, should update the anchors if area selected', () => {
        service.isAreaSelected = true;
        gridServiceSpy.onMagnetismStateChange = new Subject<void>();
        (service as any).subscribeToEvents();
        const drawAnchorsSpy = spyOn<any>(service, 'drawAnchors');
        gridServiceSpy.onMagnetismStateChange.next();
        expect(drawAnchorsSpy).toHaveBeenCalled();
    });

    it('when receiving onMagnetismStateChange event, should not update the anchors if area is not selected', () => {
        gridServiceSpy.onMagnetismStateChange = new Subject<void>();
        (service as any).subscribeToEvents();
        const drawAnchorsSpy = spyOn<any>(service, 'drawAnchors');
        gridServiceSpy.onMagnetismStateChange.next();
        expect(drawAnchorsSpy).not.toHaveBeenCalled();
    });

    it('when receiving onSelectedBoxMove event, should update the selected area preview', () => {
        mouvementServiceSpy.onSelectedBoxMove = new Subject<null>();
        (service as any).subscribeToEvents();
        const updateSelectedAreaSpy = spyOn(service, 'updateSelectedAreaPreview');
        mouvementServiceSpy.onSelectedBoxMove.next();
        expect(updateSelectedAreaSpy).toHaveBeenCalled();
    });

    it('when receiving onSelectedBoxChange event, should the selected area preview', () => {
        manipulationServiceSpy.onSelectedBoxChange = new Subject<null>();
        (service as any).subscribeToEvents();
        const updateSelectedAreaSpy = spyOn(service, 'updateSelectedAreaPreview');
        manipulationServiceSpy.onSelectedBoxChange.next();
        expect(updateSelectedAreaSpy).toHaveBeenCalled();
    });

    it('onDestroy should unsubscribe from subjects', () => {
        manipulationServiceSpy.onSelectedBoxChange = new Subject<null>();
        (service as any).subscribeToEvents();
        expect(manipulationServiceSpy.onSelectedBoxChange.observers.length).toEqual(1);
        service.ngOnDestroy();
        expect(manipulationServiceSpy.onSelectedBoxChange.observers.length).toEqual(0);
    });
});
