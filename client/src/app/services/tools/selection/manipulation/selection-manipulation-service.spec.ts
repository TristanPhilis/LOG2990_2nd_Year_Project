import { TestBed } from '@angular/core/testing';
import { SelectedBox } from '@app/classes/selected-box';
import { Vec2 } from '@app/classes/vec2';
import { DEG_TO_RAD_FACTOR } from '@app/shared/constant';
import { AnchorsPosition } from '@app/shared/enum';
import { SelectionManipulationService } from './selection-manipulation-service';

describe('SelectionManipulationService', () => {
    let service: SelectionManipulationService;
    let selectedBox: SelectedBox;
    let coord: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionManipulationService);

        selectedBox = new SelectedBox();
        const width = 20;
        const height = 40;
        selectedBox.right = width;
        selectedBox.bottom = height;

        coord = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // disable to acces lots of private attributes
    // tslint:disable:no-string-literal
    it('initializeAnchorMouvement should set correctly the aspect ratio and wich size can be resized', () => {
        service.initializeAnchorMouvement(selectedBox, AnchorsPosition.bottomLeft);
        const expectedAspectRation = 0.5;
        expect(service['aspectRatio']).toEqual(expectedAspectRation);
        expect(service['clickedAnchor']).toEqual(AnchorsPosition.bottomLeft);
        expect(service['resizeBottom']).toBeTrue();
        expect(service['resizeLeft']).toBeTrue();
        expect(service['resizeRight']).toBeFalse();
        expect(service['resizeTop']).toBeFalse();
    });

    it('initializeAnchorMouvement should set correctly wich sides can be resize', () => {
        service.initializeAnchorMouvement(selectedBox, AnchorsPosition.middleRight);
        expect(service['resizeBottom']).toBeFalse();
        expect(service['resizeLeft']).toBeFalse();
        expect(service['resizeRight']).toBeTrue();
        expect(service['resizeTop']).toBeFalse();
    });

    it('processAnchorMouvement should restore aspect ratio if keepAspectRation is true and a corner anchor is clicked', () => {
        // tslint:disable-next-line:no-any
        const restoreAspectRatioSpy = spyOn<any>(service, 'restoreAspectRatio');
        service['clickedAnchor'] = AnchorsPosition.topRight;
        service.processAnchorMouvement(selectedBox, coord, true);
        expect(restoreAspectRatioSpy).toHaveBeenCalled();
    });

    it('processAnchorMouvement should not restore aspect ratio if keepAspectRation is true and not a corner anchor is clicked', () => {
        // tslint:disable-next-line:no-any
        const restoreAspectRatioSpy = spyOn<any>(service, 'restoreAspectRatio');
        service['clickedAnchor'] = AnchorsPosition.middleBottom;
        service.processAnchorMouvement(selectedBox, coord, true);
        expect(restoreAspectRatioSpy).not.toHaveBeenCalled();
    });

    it('processAnchorMouvement should not restore aspect ratio if keepAspectRation is false and a corner anchor is clicked', () => {
        // tslint:disable-next-line:no-any
        const restoreAspectRatioSpy = spyOn<any>(service, 'restoreAspectRatio');
        service['clickedAnchor'] = AnchorsPosition.topRight;
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(restoreAspectRatioSpy).not.toHaveBeenCalled();
    });

    it('processAnchorMouvement should call updateDirtyAnchors with the right set of dirty anchors', () => {
        service['resizeBottom'] = true;
        const expectedSet = new Set([
            AnchorsPosition.bottomLeft,
            AnchorsPosition.bottomRight,
            AnchorsPosition.middleBottom,
            AnchorsPosition.middleLeft,
            AnchorsPosition.middleRight,
        ]);
        // tslint:disable-next-line:no-any
        const updateDirtyAnchorsSpy = spyOn<any>(service, 'updateDirtyAnchors');
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(updateDirtyAnchorsSpy).toHaveBeenCalledWith(selectedBox, expectedSet);
        service['resizeLeft'] = true;
        expectedSet.add(AnchorsPosition.topLeft).add(AnchorsPosition.middleTop);
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(updateDirtyAnchorsSpy).toHaveBeenCalledWith(selectedBox, expectedSet);
    });

    it('processAnchorMouvement should call updateDirtyAnchors with the right set of dirty anchors', () => {
        service['resizeRight'] = true;
        const expectedSet = new Set([
            AnchorsPosition.middleRight,
            AnchorsPosition.topRight,
            AnchorsPosition.bottomRight,
            AnchorsPosition.middleBottom,
            AnchorsPosition.middleTop,
        ]);
        // tslint:disable-next-line:no-any
        const updateDirtyAnchorsSpy = spyOn<any>(service, 'updateDirtyAnchors');
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(updateDirtyAnchorsSpy).toHaveBeenCalledWith(selectedBox, expectedSet);
        service['resizeTop'] = true;
        expectedSet.add(AnchorsPosition.topLeft).add(AnchorsPosition.middleLeft);
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(updateDirtyAnchorsSpy).toHaveBeenCalledWith(selectedBox, expectedSet);
    });

    it('processAnchorMouvement should update the selectedBox size', () => {
        service['resizeRight'] = true;
        const newRight = 50;
        const expectedBottomtPos = 40;
        coord = { x: newRight, y: 0 };
        service.processAnchorMouvement(selectedBox, coord, false);
        expect(selectedBox.bottom).toEqual(expectedBottomtPos);
        expect(selectedBox.right).toEqual(newRight);
    });

    it('processWheelMouvement should update the selectedBox angle', () => {
        const newAngle = 45;
        service.processWheelMouvement(selectedBox, newAngle);
        expect(selectedBox.angle).toEqual(newAngle);
        service.processWheelMouvement(selectedBox, newAngle);
        expect(selectedBox.angle).toEqual(newAngle * 2);
    });

    it('adjustPositionToNewCenter should recenter the selectedBox and update the rotation center atribute', () => {
        const angle = 15;
        selectedBox.angle = angle;

        const width = 20;
        const height = 40;

        selectedBox.rotationCenter = { x: width / 2, y: height / 2 };
        // doubling the width and height, simulates a right anchor mouvement
        selectedBox.right = width * 2;

        const centerShift = 10;
        service.adjustPositionToNewCenter(selectedBox);
        const expectedShift = {
            x: centerShift * Math.cos(angle * DEG_TO_RAD_FACTOR),
            y: centerShift * Math.sin(angle * DEG_TO_RAD_FACTOR),
        };
        expect(selectedBox.center.x).toEqual(width / 2 + expectedShift.x);
        expect(selectedBox.center.y).toEqual(height / 2 + expectedShift.y);
        expect(selectedBox.rotationCenter).toEqual(selectedBox.center);
    });

    it('RestoreAspectRatio should change the size to keep the aspectRatio attribute of the selectedBox', () => {
        const initialBottomCoord = 40;
        const newBottomCoord = 150;
        const aspectRatio = 0.5;
        service['aspectRatio'] = aspectRatio;
        selectedBox.bottom = newBottomCoord;
        // tslint:disable-next-line:no-any
        (service as any).restoreAspectRatio(selectedBox);
        expect(selectedBox.bottom).toEqual(initialBottomCoord);
    });

    it('updateDirtyAnchors should update the anchors position', () => {
        const newLeft = 45;
        selectedBox.left = newLeft;
        // tslint:disable-next-line:no-any
        (service as any).updateDirtyAnchors(selectedBox, new Set([AnchorsPosition.middleLeft, AnchorsPosition.topLeft, AnchorsPosition.bottomLeft]));
        expect(selectedBox.anchors.get(AnchorsPosition.middleLeft)?.centerCoord.x).toEqual(newLeft);
        expect(selectedBox.anchors.get(AnchorsPosition.topLeft)?.centerCoord.x).toEqual(newLeft);
        expect(selectedBox.anchors.get(AnchorsPosition.bottomLeft)?.centerCoord.x).toEqual(newLeft);
    });
});
