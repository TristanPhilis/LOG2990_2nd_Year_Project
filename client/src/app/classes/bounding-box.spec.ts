import { BoundingBox } from './bounding-box';
import { SelectionBox } from './selection-box';

describe('BoundingBox', () => {
    let boundingBox: BoundingBox;
    const corner = 10;
    const width = 20;
    const height = 30;
    beforeEach(() => {
        boundingBox = new BoundingBox();
        boundingBox.top = corner;
        boundingBox.left = corner;
        boundingBox.right = corner + width;
        boundingBox.bottom = corner + height;
    });

    it('Should create an instance', () => {
        expect(boundingBox).toBeTruthy();
    });

    it('should return the right top left corner position', () => {
        expect(boundingBox.position).toEqual({ x: corner, y: corner });
    });

    it('should return the right width', () => {
        expect(boundingBox.width).toEqual(width);
    });

    it('should return the right height', () => {
        expect(boundingBox.height).toEqual(height);
    });

    it('setStaringCoord should overwrite current posisitons', () => {
        // tslint:disable-next-line:no-magic-number
        const startingCoord = { x: 34, y: 234 };
        boundingBox.setStartingCoord(startingCoord);
        expect(boundingBox.top).toEqual(startingCoord.y);
        expect(boundingBox.bottom).toEqual(startingCoord.y);
        expect(boundingBox.right).toEqual(startingCoord.x);
        expect(boundingBox.left).toEqual(startingCoord.x);
    });

    it('Should update correctly based on selection box', () => {
        const selectionBox = new SelectionBox();
        selectionBox.setAnchor({ x: 0, y: 0 });
        const selectionWidth = 100;
        const selectionHeight = 200;
        selectionBox.updateOpposingCorner({ x: selectionWidth, y: selectionHeight });
        boundingBox.updateFromSelectionBox(selectionBox, false);
        expect(boundingBox.top).toEqual(0);
        expect(boundingBox.left).toEqual(0);
        expect(boundingBox.right).toEqual(selectionWidth);
        expect(boundingBox.bottom).toEqual(selectionHeight);
    });

    it('Should update correctly based on squared selection box', () => {
        const selectionBox = new SelectionBox();
        selectionBox.setAnchor({ x: 0, y: 0 });
        const selectionWidth = 100;
        const selectionHeight = 200;
        selectionBox.updateOpposingCorner({ x: selectionWidth, y: selectionHeight });
        boundingBox.updateFromSelectionBox(selectionBox, true);
        expect(boundingBox.top).toEqual(0);
        expect(boundingBox.left).toEqual(0);
        expect(boundingBox.right).toEqual(selectionWidth);
        expect(boundingBox.bottom).toEqual(selectionWidth);
    });

    it('Should translate on the x axis', () => {
        const translationValue = 5;
        boundingBox.translateX(translationValue);
        expect(boundingBox.left).toEqual(corner + translationValue);
        expect(boundingBox.width).toEqual(width);
    });

    it('Should translate on the y axis', () => {
        const translationValue = 5;
        boundingBox.translateY(translationValue);
        expect(boundingBox.top).toEqual(corner + translationValue);
        expect(boundingBox.height).toEqual(height);
    });

    it('updating with top right coord should update properly', () => {
        // tslint:disable-next-line:no-magic-number
        const topRightCoord = { x: 40, y: 0 };
        boundingBox.update(topRightCoord);
        expect(boundingBox.top).toEqual(topRightCoord.y);
        expect(boundingBox.right).toEqual(topRightCoord.x);
        expect(boundingBox.width).toEqual(topRightCoord.x - corner);
        expect(boundingBox.height).toEqual(corner + height);
    });

    it('updating with bottom left coord should update properly', () => {
        // tslint:disable-next-line:no-magic-number
        const bottomLeftCoord = { x: 0, y: 50 };
        boundingBox.update(bottomLeftCoord);
        expect(boundingBox.bottom).toEqual(bottomLeftCoord.y);
        expect(boundingBox.left).toEqual(bottomLeftCoord.x);
        expect(boundingBox.width).toEqual(corner + width);
        expect(boundingBox.height).toEqual(bottomLeftCoord.y - corner);
    });

    it('isInBoxShould return true if coord in box', () => {
        // tslint:disable-next-line:no-magic-number
        const result = boundingBox.isInBox({ x: 20, y: 20 });
        expect(result).toBeTrue();
    });

    it('isInBox should return false if coord not in box', () => {
        const result = boundingBox.isInBox({ x: 0, y: 0 });
        expect(result).toBeFalse();
    });
});
