import { BoundingBox } from './bounding-box';

describe('BoundingBox', () => {
    let boundingBox: BoundingBox;
    beforeEach(() => {
        boundingBox = new BoundingBox();
    });

    it('Should create an instance', () => {
        expect(boundingBox).toBeTruthy();
    });
});
