import { AnchorsPosition } from '@app/shared/enum';
import { SelectedBox } from './selected-box';
import { SelectionBox } from './selection-box';

describe('SelectedBox', () => {
    let selectedBox: SelectedBox;
    const corner = 10;
    const width = 20;
    const height = 30;
    beforeEach(() => {
        selectedBox = new SelectedBox();
        selectedBox.top = corner;
        selectedBox.left = corner;
        selectedBox.right = corner + width;
        selectedBox.bottom = corner + height;
        selectedBox.initializeAnchors();
    });

    it('Should create an instance', () => {
        expect(selectedBox).toBeTruthy();
    });

    it('should return the right top left corner position', () => {
        expect(selectedBox.position).toEqual({ x: corner, y: corner });
    });

    it('should return the right width', () => {
        expect(selectedBox.width).toEqual(width);
    });

    it('should return the right height', () => {
        expect(selectedBox.height).toEqual(height);
    });

    it('Should update correctly based on selection box', () => {
        const selectionBox = new SelectionBox();
        selectionBox.setAnchor({ x: 0, y: 0 });
        const selectionWidth = 100;
        const selectionHeight = 200;
        selectionBox.updateOpposingCorner({ x: selectionWidth, y: selectionHeight });
        selectedBox.updateFromSelectionBox(selectionBox, false);
        expect(selectedBox.top).toEqual(0);
        expect(selectedBox.left).toEqual(0);
        expect(selectedBox.right).toEqual(selectionWidth);
        expect(selectedBox.bottom).toEqual(selectionHeight);
    });

    it('Should update correctly based on squared selection box', () => {
        const selectionBox = new SelectionBox();
        selectionBox.setAnchor({ x: 0, y: 0 });
        const selectionWidth = 100;
        const selectionHeight = 200;
        selectionBox.updateOpposingCorner({ x: selectionWidth, y: selectionHeight });
        selectedBox.updateFromSelectionBox(selectionBox, true);
        expect(selectedBox.top).toEqual(0);
        expect(selectedBox.left).toEqual(0);
        expect(selectedBox.right).toEqual(selectionWidth);
        expect(selectedBox.bottom).toEqual(selectionWidth);
    });

    it('refreshBoundingBox should update the bounding box coord based on the anchors position', () => {
        selectedBox.refreshBoundingBox();
        expect(selectedBox.boundingBox.left).toEqual(corner);
        expect(selectedBox.boundingBox.top).toEqual(corner);
        expect(selectedBox.boundingBox.right).toEqual(corner + width);
        expect(selectedBox.boundingBox.bottom).toEqual(corner + height);
    });

    it('translateX should translate the box and the anchors', () => {
        const translation = 105;
        selectedBox.translateX(translation);
        expect(selectedBox.left).toEqual(corner + translation);
        expect(selectedBox.top).toEqual(corner);
        expect(selectedBox.right).toEqual(corner + width + translation);
        expect(selectedBox.anchors.get(AnchorsPosition.topLeft)?.centerCoord.x).toEqual(corner + translation);
    });

    it('translateX should translate the mouseCoord if it exist', () => {
        const translation = 105;
        selectedBox.mouseCoord = { x: 0, y: 0 };
        const expectedMouseCoord = { x: translation, y: 0 };
        selectedBox.translateX(translation);
        expect(selectedBox.mouseCoord).toEqual(expectedMouseCoord);
    });

    it('translateY should translate the box and the anchors', () => {
        const translation = 105;
        selectedBox.translateY(translation);
        expect(selectedBox.top).toEqual(corner + translation);
        expect(selectedBox.left).toEqual(corner);
        expect(selectedBox.bottom).toEqual(corner + height + translation);
        expect(selectedBox.anchors.get(AnchorsPosition.topLeft)?.centerCoord.y).toEqual(corner + translation);
    });

    it('translateX should translate the mouseCoord if it exist', () => {
        const translation = 105;
        selectedBox.mouseCoord = { x: 0, y: 0 };
        const expectedMouseCoord = { x: 0, y: translation };
        selectedBox.translateY(translation);
        expect(selectedBox.mouseCoord).toEqual(expectedMouseCoord);
    });

    it('isInBox should return true when coord is in box', () => {
        const insideCoord = { x: corner + 1, y: corner + 1 };
        const result = selectedBox.isInBox(insideCoord);
        expect(result).toBeTrue();
    });

    it('isInBox should return false when coord is not in box', () => {
        const insideCoord = { x: corner - 1, y: corner - 1 };
        const result = selectedBox.isInBox(insideCoord);
        expect(result).toBeFalse();
    });

    it('getAnchorCoord should return the selectedBox center when the anchorPosition is center', () => {
        const result = selectedBox.getAnchorCoord(AnchorsPosition.center);
        expect(result.x).toEqual(corner + width / 2);
        expect(result.y).toEqual(corner + height / 2);
    });

    it('getAnchorCoord should return the anchors centerCoord when the anchorPosition is not the center', () => {
        const result = selectedBox.getAnchorCoord(AnchorsPosition.topRight);
        expect(result.x).toEqual(corner + width);
        expect(result.y).toEqual(corner);
    });

    it('getAnchorCoord should return the angle adjusted coord', () => {
        const adjustAngleSpy = spyOn(selectedBox, 'getAngleAdjustedCoord');
        selectedBox.getAnchorCoord(AnchorsPosition.center);
        expect(adjustAngleSpy).toHaveBeenCalledWith(selectedBox.center);
    });

    it('getAngleAdjustedCoord should return the coord rotated around the selectedBox rotationCenter based on the selectedBox angle', () => {
        const angle = 90;
        selectedBox.angle = angle;
        // center is at 20, 25
        selectedBox.rotationCenter = selectedBox.center;
        const initialCoord = { x: corner, y: corner };
        const result = selectedBox.getAngleAdjustedCoord(initialCoord);
        const expectedX = 35;
        const expectedY = 15;
        expect(result.x).toBeCloseTo(expectedX, 2);
        expect(result.y).toBeCloseTo(expectedY, 2);
    });

    it('getAngleAdjustedCoord with reverseAngle to true should rotate the other way around', () => {
        const angle = 90;
        selectedBox.angle = angle;
        // center is at 20, 25
        selectedBox.rotationCenter = selectedBox.center;
        const initialCoord = { x: corner, y: corner };
        const result = selectedBox.getAngleAdjustedCoord(initialCoord, true);
        const expectedX = 5;
        const expectedY = 35;
        expect(result.x).toBeCloseTo(expectedX, 2);
        expect(result.y).toBeCloseTo(expectedY, 2);
    });

    it('Copy should return a valid selectedBox with the same attributes values', () => {
        const result = selectedBox.copy();
        expect(result.left).toEqual(selectedBox.left);
        expect(result.right).toEqual(selectedBox.right);
        expect(result.top).toEqual(selectedBox.top);
        expect(result.bottom).toEqual(selectedBox.bottom);
        expect(result.angle).toEqual(selectedBox.angle);
        expect(result.rotationCenter).toEqual(selectedBox.rotationCenter);
    });
});
