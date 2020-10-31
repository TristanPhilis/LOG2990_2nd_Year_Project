import { SelectionBox } from './selection-box';

describe('BoundingBox', () => {
    let selectionBox: SelectionBox;
    beforeEach(() => {
        selectionBox = new SelectionBox();
    });

    it('Should create an instance', () => {
        expect(selectionBox).toBeTruthy();
    });
});
