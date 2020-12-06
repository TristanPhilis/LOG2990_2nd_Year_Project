import { TestBed } from '@angular/core/testing';
import { BoundingBox } from '@app/classes/bounding-box';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectedBox } from '@app/classes/selected-box';
import { GridService } from '@app/services/grid/grid-service';
import { DEPLACEMENT, KEYS } from '@app/shared/constant';
import { AnchorsPosition } from '@app/shared/enum';
import { SelectionMouvementService } from './selection-mouvement-service';

describe('SelectionMouvementService', () => {
    let service: SelectionMouvementService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    let selectedBox: SelectedBox;
    let onMoveEventSpy: jasmine.Spy;

    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridService', [''], ['canvasWidth', 'canvasHeight']);
        TestBed.configureTestingModule({
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
        });
        service = TestBed.inject(SelectionMouvementService);

        onMoveEventSpy = spyOn(service.onSelectedBoxMove, 'next');

        // setting up selectedBox
        selectedBox = new SelectedBox();
        selectedBox.boundingBox = new BoundingBox();
        const width = 40;
        const height = 20;
        selectedBox.left = 0;
        selectedBox.top = 0;
        selectedBox.right = width;
        selectedBox.bottom = height;
        selectedBox.rotationCenter = selectedBox.center;
        // simulate clicking in the middle of the box
        selectedBox.mouseCoord = { x: width / 2, y: height / 2 };
        selectedBox.initializeAnchors();

        // setting up gridService attributes
        // tslint:disable-next-line:no-string-literal
        service['gridService'].currentAnchor = AnchorsPosition.topLeft;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('canProcessKey should return true on arrow keys', () => {
        expect(service.canProcessKey(KEYS.ARROW_DOWN)).toBeTrue();
        expect(service.canProcessKey(KEYS.ARROW_UP)).toBeTrue();
        expect(service.canProcessKey(KEYS.ARROW_LEFT)).toBeTrue();
        expect(service.canProcessKey(KEYS.ARROW_RIGHT)).toBeTrue();
    });

    it('canProcessKey should return false on non arrow keys', () => {
        expect(service.canProcessKey(KEYS.SHIFT)).toBeFalse();
        expect(service.canProcessKey(KEYS.BACKSPACE)).toBeFalse();
    });

    // tslint:disable:no-magic-numbers for easier coord manipulation
    it('processMouseMouvement should call translateSelectedBox with the right params and emit onMove event', () => {
        const currentMouseCoord = { x: 17, y: 12 };
        const expectedTranslation = { x: -3, y: 2 };
        // tslint:disable-next-line:no-any private method
        const translateBoxSpy = spyOn<any>(service, 'translateSelectedBox');
        service.processMouseMouvement(selectedBox, currentMouseCoord);
        expect(translateBoxSpy).toHaveBeenCalledWith(selectedBox, expectedTranslation.x, expectedTranslation.y);
        expect(onMoveEventSpy).toHaveBeenCalled();
    });
    // tslint:enable:no-magic-numbers

    // tslint:disable:no-string-literal private member access
    it('processMouseMouvement should call snapBoxToGrid if the magentism is active', () => {
        service['gridService'].shouldSnapToGrid = true;
        // tslint:disable-next-line:no-any private method
        const snapBoxSpy = spyOn<any>(service, 'snapBoxToGrid');
        const dummyCoord = { x: 0, y: 0 };
        service.processMouseMouvement(selectedBox, dummyCoord);
        expect(snapBoxSpy).toHaveBeenCalled();
    });

    it('processKeyUp should remove the key in the pressedKeys set', () => {
        service['pressedKeys'] = new Set([KEYS.ARROW_DOWN, KEYS.ARROW_LEFT]);
        service.processKeyUp(selectedBox, KEYS.ARROW_DOWN);
        expect(service['pressedKeys'].has(KEYS.ARROW_DOWN)).toBeFalse();
        expect(service['pressedKeys'].size).toEqual(1);
    });

    it('processKeyUp should remove the key in the pendingKey set if present and call moveFromKeys with it', () => {
        // tslint:disable-next-line:no-any private method
        const moveFromKeysSpy = spyOn<any>(service, 'moveFromKeys');
        service['pendingKeys'] = new Set([KEYS.ARROW_DOWN, KEYS.ARROW_LEFT]);
        service.processKeyUp(selectedBox, KEYS.ARROW_DOWN);
        expect(service['pendingKeys'].has(KEYS.ARROW_DOWN)).toBeFalse();
        expect(service['pendingKeys'].size).toEqual(1);
        expect(moveFromKeysSpy).toHaveBeenCalledWith(selectedBox, new Set([KEYS.ARROW_DOWN]));
    });

    it('processKeyUp should stop the timer if the pressedKeys set is empty', () => {
        const clearIntervalSpy = spyOn(global, 'clearInterval');
        service.processKeyUp(selectedBox, KEYS.ARROW_LEFT);
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('processKeyDown should return early if the key is already in the pressed set', () => {
        service['pressedKeys'] = new Set([KEYS.ARROW_DOWN, KEYS.ARROW_LEFT]);
        service.processKeyDown(selectedBox, KEYS.ARROW_DOWN);
        expect(service['pendingKeys'].size).toEqual(0);
    });

    describe('selection mouvement test with timers', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('processKeyDown should add the key to the pending set', () => {
            service.processKeyDown(selectedBox, KEYS.ARROW_LEFT);
            expect(service['pendingKeys'].has(KEYS.ARROW_LEFT)).toBeTrue();
        });

        it('processKeyDown should add the pending key in the pressedKeys after the timeout', () => {
            service.processKeyDown(selectedBox, KEYS.ARROW_LEFT);
            const tickTime = 501;
            jasmine.clock().tick(tickTime);
            expect(service['pressedKeys'].has(KEYS.ARROW_LEFT)).toBeTrue();
        });

        it('if the key is released before the pending timeout, it should not be added to the pressed keys', () => {
            const tickTime = 300;
            service.processKeyDown(selectedBox, KEYS.ARROW_LEFT);
            jasmine.clock().tick(tickTime);
            expect(service['pendingKeys'].has(KEYS.ARROW_LEFT)).toBeTrue();
            service.processKeyUp(selectedBox, KEYS.ARROW_LEFT);
            jasmine.clock().tick(tickTime);
            expect(service['pressedKeys'].has(KEYS.ARROW_LEFT)).toBeFalse();
        });

        it('after pending timeout, if not moving and key is still pending, should start mouvement', () => {
            // tslint:disable-next-line:no-any private method
            const startMouvementSpy = spyOn<any>(service, 'startMouvement');
            service['isMoving'] = false;
            service.processKeyDown(selectedBox, KEYS.ARROW_LEFT);
            const tickTime = 501;
            jasmine.clock().tick(tickTime);
            expect(service['isMoving']).toBeTrue();
            expect(startMouvementSpy).toHaveBeenCalled();
        });

        it('if already moving, should start a new timer', () => {
            // tslint:disable-next-line:no-any private method
            const startMouvementSpy = spyOn<any>(service, 'startMouvement');
            service['isMoving'] = true;
            service.processKeyDown(selectedBox, KEYS.ARROW_LEFT);
            const tickTime = 501;
            jasmine.clock().tick(tickTime);
            expect(service['pressedKeys'].has(KEYS.ARROW_LEFT)).toBeTrue();
            expect(startMouvementSpy).not.toHaveBeenCalled();
        });

        it('startMouvement should start a timer that calls moveFromKeys every 100 ms', () => {
            // tslint:disable-next-line:no-any private method
            const moveFromKeysSpy = spyOn<any>(service, 'moveFromKeys');
            // tslint:disable-next-line:no-any private method
            (service as any).startMouvement(selectedBox);

            const tickTime = 501;
            jasmine.clock().tick(tickTime);
            const expectedNumberOfCalls = 5;
            expect(moveFromKeysSpy).toHaveBeenCalledTimes(expectedNumberOfCalls);
        });
    }); // end of test with timers

    it('moveFromKeys should call translateSelectedBox with right values when no magnetism and emit onMove', () => {
        // tslint:disable-next-line:no-any private method
        const translateBoxSpy = spyOn<any>(service, 'translateSelectedBox');

        let keys = new Set([KEYS.ARROW_LEFT, KEYS.ARROW_DOWN]);
        let expectedXTranslation = -DEPLACEMENT;
        let expectedYTranslation = DEPLACEMENT;
        // tslint:disable-next-line:no-any private method
        (service as any).moveFromKeys(selectedBox, keys);
        expect(translateBoxSpy).toHaveBeenCalledWith(selectedBox, expectedXTranslation, expectedYTranslation);
        expect(onMoveEventSpy).toHaveBeenCalled();

        keys = new Set([KEYS.ARROW_RIGHT, KEYS.ARROW_UP]);
        expectedXTranslation = DEPLACEMENT;
        expectedYTranslation = -DEPLACEMENT;
        // tslint:disable-next-line:no-any private method
        (service as any).moveFromKeys(selectedBox, keys);
        expect(translateBoxSpy).toHaveBeenCalledWith(selectedBox, expectedXTranslation, expectedYTranslation);
        expect(onMoveEventSpy).toHaveBeenCalled();
    });

    // tslint:disable:no-any private methods
    it('moveFromKeys should get the coords from the translations to grid type of functions and call snapToGrid', () => {
        service['gridService'].shouldSnapToGrid = true;
        const snapBoxSpy = spyOn<any>(service, 'snapBoxToGrid');
        const higherBoundSnapSpy = spyOn<any>(service, 'getTranslationToHigherBoundGrid');
        const lowerBoundSnapSpy = spyOn<any>(service, 'getTranslationToLowerBoundGrid');

        const keys = new Set([KEYS.ARROW_LEFT, KEYS.ARROW_DOWN, KEYS.ARROW_RIGHT, KEYS.ARROW_UP]);
        (service as any).moveFromKeys(selectedBox, keys);
        expect(snapBoxSpy).toHaveBeenCalled();
        expect(higherBoundSnapSpy).toHaveBeenCalledTimes(2);
        expect(lowerBoundSnapSpy).toHaveBeenCalledTimes(2);
    });
    // tslint:enable:no-any private methods

    it('adjustBoxIfMovingOutsideCanvas should bring back the box in canvas when about to leave left or top', () => {
        const refreshBoundingBoxSpy = spyOn(selectedBox, 'refreshBoundingBox');
        const translateXSpy = spyOn(selectedBox, 'translateX');
        const translateYSpy = spyOn(selectedBox, 'translateY');
        const outSideLeftCoord = -40;
        const outSideUPCoord = -23;
        selectedBox.boundingBox.right = outSideLeftCoord;
        selectedBox.boundingBox.bottom = outSideUPCoord;
        // tslint:disable-next-line:no-any private method
        (service as any).adjustBoxIfMovingOutsideCanvas(selectedBox);
        expect(refreshBoundingBoxSpy).toHaveBeenCalled();
        expect(translateXSpy).toHaveBeenCalledWith(-outSideLeftCoord);
        expect(translateYSpy).toHaveBeenCalledWith(-outSideUPCoord);
    });

    // Problem with getter of gridService for canvas height
    it('adjustBoxIfMovingOutsideCanvas should bring back the box in canvas when about to leave right or bottom', () => {
        const width = 100;
        const height = 100;
        const outsideDistance = 5;
        canvasTestHelper.getSpyObjectProperty(gridServiceSpy, 'canvasHeight').and.returnValue(height); // tslint:disable-next-line:no-null-assertion
        canvasTestHelper.getSpyObjectProperty(gridServiceSpy, 'canvasWidth').and.returnValue(width);
        const refreshBoundingBoxSpy = spyOn(selectedBox, 'refreshBoundingBox');
        const translateXSpy = spyOn(selectedBox, 'translateX');
        const translateYSpy = spyOn(selectedBox, 'translateY');
        selectedBox.boundingBox.left = width + outsideDistance;
        selectedBox.boundingBox.top = height + outsideDistance;
        // tslint:disable-next-line:no-any private method
        (service as any).adjustBoxIfMovingOutsideCanvas(selectedBox);
        expect(refreshBoundingBoxSpy).toHaveBeenCalled();
        expect(translateXSpy).toHaveBeenCalledWith(-outsideDistance);
        expect(translateYSpy).toHaveBeenCalledWith(-outsideDistance);
    });

    it('snapBoxToGrid should snap the current selected anchor to the nearest point', () => {
        const stubTranslationValue = 10;
        // tslint:disable-next-line:no-any private method
        const closestTranslationSpy = spyOn<any>(service, 'getTranslationToClosestGrid');
        closestTranslationSpy.and.returnValue(stubTranslationValue);
        // tslint:disable-next-line:no-any private method
        const translateBoxSpy = spyOn<any>(service, 'translateSelectedBox');
        // tslint:disable-next-line:no-any private method
        (service as any).snapBoxToGrid(selectedBox);
        expect(translateBoxSpy).toHaveBeenCalledWith(selectedBox, stubTranslationValue, stubTranslationValue);
        expect(closestTranslationSpy).toHaveBeenCalledTimes(2);
    });

    it('getTranslationToClosestGrid should return the distance to the closest line', () => {
        const gridSquareSize = 20;
        gridServiceSpy.squareSize = gridSquareSize;
        const point1 = 6;
        // tslint:disable-next-line:no-any
        let result = (service as any).getTranslationToClosestGrid(point1);
        expect(result).toEqual(-point1);

        const point2 = 14;
        // tslint:disable-next-line:no-any
        result = (service as any).getTranslationToClosestGrid(point2);
        expect(result).toEqual(gridSquareSize - point2);
    });

    it('getTranslationToLowerBoundGrid should return the distance to the closest lower bound line', () => {
        const gridSquareSize = 20;
        gridServiceSpy.squareSize = gridSquareSize;
        const point1 = 39;
        // tslint:disable-next-line:no-any
        let result = (service as any).getTranslationToLowerBoundGrid(point1);
        expect(result).toEqual(gridSquareSize - point1);

        const point2 = 40;
        // tslint:disable-next-line:no-any
        result = (service as any).getTranslationToLowerBoundGrid(point2);
        expect(result).toEqual(-gridSquareSize);
    });

    it('getTranslationToHigherBoundGrid should return the distance to the closest higher bound line', () => {
        const gridSquareSize = 20;
        gridServiceSpy.squareSize = gridSquareSize;
        const point1 = 19;
        // tslint:disable-next-line:no-any
        let result = (service as any).getTranslationToHigherBoundGrid(point1);
        expect(result).toEqual(gridSquareSize - point1);

        const point2 = 40;
        // tslint:disable-next-line:no-any
        result = (service as any).getTranslationToHigherBoundGrid(point2);
        expect(result).toEqual(gridSquareSize);
    });

    it('translateSelectedBox should call the respective selectedBox translation methods', () => {
        const translateXSpy = spyOn(selectedBox, 'translateX');
        const translateYSpy = spyOn(selectedBox, 'translateY');
        const xTranslation = 45;
        const yTranslation = -568;
        // tslint:disable-next-line:no-any
        (service as any).translateSelectedBox(selectedBox, xTranslation, yTranslation);
        expect(translateXSpy).toHaveBeenCalledWith(xTranslation);
        expect(translateYSpy).toHaveBeenCalledWith(yTranslation);
    });
});
