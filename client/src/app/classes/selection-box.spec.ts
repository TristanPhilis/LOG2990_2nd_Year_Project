import { SelectionBox } from './selection-box';
import { Vec2 } from './vec2';

describe('SelectionBox', () => {
    let selectionBox: SelectionBox;
    let anchorCoord: Vec2;
    let topLeftCorner: Vec2;
    let bottomRightCorner: Vec2;
    let topRightCorner: Vec2;
    let bottomLeftCorner: Vec2;
    const diff = 5;
    const startingCoord = 40;

    beforeEach(() => {
        selectionBox = new SelectionBox();
        anchorCoord = { x: startingCoord, y: startingCoord };
        bottomRightCorner = { x: startingCoord + diff, y: startingCoord + diff };
        bottomLeftCorner = { x: startingCoord - diff, y: startingCoord + diff };
        topLeftCorner = { x: startingCoord - diff, y: startingCoord - diff };
        topRightCorner = { x: startingCoord + diff, y: startingCoord - diff };
        selectionBox.setAnchor(anchorCoord);
        selectionBox.updateOpposingCorner(bottomRightCorner);
    });

    it('Should create an instance', () => {
        expect(selectionBox).toBeTruthy();
    });

    it('setAnchor should set the anchor value', () => {
        selectionBox.setAnchor(topLeftCorner);
        // tslint:disable-next-line:no-string-literal
        expect(selectionBox['anchor']).toEqual(topLeftCorner);
    });

    it('updateOpposingCorner should change opposingCorner value', () => {
        selectionBox.updateOpposingCorner(topLeftCorner);
        // tslint:disable-next-line:no-string-literal
        expect(selectionBox['opposingCorner']).toEqual(topLeftCorner);
    });

    it('Should return the right top/left corner position', () => {
        // opposing is bottom right
        expect(selectionBox.position).toEqual(anchorCoord);

        // oppposing is top left
        selectionBox.updateOpposingCorner(topLeftCorner);
        expect(selectionBox.position).toEqual(topLeftCorner);

        // opposing is top right
        selectionBox.updateOpposingCorner(topRightCorner);
        expect(selectionBox.position.x).toEqual(anchorCoord.x);
        expect(selectionBox.position.y).toEqual(topRightCorner.y);

        // opposing is bottom left
        selectionBox.updateOpposingCorner(bottomLeftCorner);
        expect(selectionBox.position.x).toEqual(bottomLeftCorner.x);
        expect(selectionBox.position.y).toEqual(anchorCoord.y);
    });

    it('should return right width', () => {
        expect(selectionBox.width).toEqual(diff);
    });

    it('should return right heigth', () => {
        expect(selectionBox.height).toEqual(diff);
    });

    it('Should return the right squareSize', () => {
        const rectangleWidth = 20;
        const rectangleHeight = 10;
        selectionBox.updateOpposingCorner({ x: startingCoord + rectangleWidth, y: startingCoord + rectangleHeight });
        expect(selectionBox.squareSize).toEqual(rectangleHeight);
    });

    it('Should return the right squarePosition', () => {
        const rectangleWidth = 20;
        const rectangleHeight = 10;

        // top left
        selectionBox.updateOpposingCorner({ x: startingCoord - rectangleWidth, y: startingCoord - rectangleHeight });
        expect(selectionBox.squarePosition.x).toEqual(startingCoord - rectangleHeight);
        expect(selectionBox.squarePosition.y).toEqual(startingCoord - rectangleHeight);

        // top right
        selectionBox.updateOpposingCorner({ x: startingCoord + rectangleWidth, y: startingCoord - rectangleHeight });
        expect(selectionBox.squarePosition.x).toEqual(startingCoord);
        expect(selectionBox.squarePosition.y).toEqual(startingCoord - rectangleHeight);

        // bottom right
        selectionBox.updateOpposingCorner({ x: startingCoord + rectangleWidth, y: startingCoord + rectangleHeight });
        expect(selectionBox.squarePosition).toEqual(anchorCoord);

        // bottom left
        selectionBox.updateOpposingCorner({ x: startingCoord - rectangleWidth, y: startingCoord + rectangleHeight });
        expect(selectionBox.squarePosition.x).toEqual(startingCoord - rectangleHeight);
        expect(selectionBox.squarePosition.y).toEqual(startingCoord);
    });

    it('Should return the right center', () => {
        const expectedCenter = 42.5;
        const result = selectionBox.center;
        expect(result).toEqual({ x: expectedCenter, y: expectedCenter });
    });

    // disabling for easy center position verification
    // tslint:disable:no-magic-numbers
    it('Should return the right squareCenter', () => {
        const rectangleWidth = 20;
        const rectangleHeight = 10;

        // top left
        let expectedX = 35;
        let expectedY = 35;
        selectionBox.updateOpposingCorner({ x: startingCoord - rectangleWidth, y: startingCoord - rectangleHeight });
        expect(selectionBox.squareCenter).toEqual({ x: expectedX, y: expectedY });

        // top right
        expectedX = 45;
        expectedY = 35;
        selectionBox.updateOpposingCorner({ x: startingCoord + rectangleWidth, y: startingCoord - rectangleHeight });
        expect(selectionBox.squareCenter).toEqual({ x: expectedX, y: expectedY });

        // bottom right
        expectedX = 45;
        expectedY = 45;
        selectionBox.updateOpposingCorner({ x: startingCoord + rectangleWidth, y: startingCoord + rectangleHeight });
        expect(selectionBox.squareCenter).toEqual({ x: expectedX, y: expectedY });

        // bottom left
        expectedX = 35;
        expectedY = 45;
        selectionBox.updateOpposingCorner({ x: startingCoord - rectangleWidth, y: startingCoord + rectangleHeight });
        expect(selectionBox.squareCenter).toEqual({ x: expectedX, y: expectedY });
    });
    // tslint:enable:no-magic-numbers

    it('should return the right circle radius', () => {
        const expectedRadius = 2.5;
        const result = selectionBox.circleRadius;
        expect(result).toEqual(expectedRadius);
    });
});
