import { TestBed } from '@angular/core/testing';
import { Anchor } from '@app/classes/anchor';
import { SelectedBox } from '@app/classes/selected-box';
import { AnchorsPosition } from '@app/shared/enum';
import { HitboxDetectionService } from './hitbox-detection-service';

describe('HitboxDetectionService', () => {
    let service: HitboxDetectionService;
    // tslint:disable-next-line:no-any
    let anchorNextSpy: jasmine.Spy;
    // tslint:disable-next-line:no-any
    let selectedBoxNextSpy: jasmine.Spy;
    let selectedBox: SelectedBox;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HitboxDetectionService);
        anchorNextSpy = spyOn(service.onAnchorClicked, 'next');
        selectedBoxNextSpy = spyOn(service.onSelectedBoxClicked, 'next');
        selectedBox = new SelectedBox();
        const width = 10;
        const height = 20;
        selectedBox.bottom = height;
        selectedBox.right = width;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Subject attribute should be active after initialisation of service', () => {
        expect(service.onAnchorClicked.isStopped).toBeFalse();
        expect(service.onSelectedBoxClicked.isStopped).toBeFalse();
    });

    it('Subject attribute should be stopped after destruction of service', () => {
        service.ngOnDestroy();
        expect(service.onAnchorClicked.isStopped).toBeTrue();
        expect(service.onSelectedBoxClicked.isStopped).toBeTrue();
    });

    it('a click inside the box should call next on the selectedBox subject and return true', () => {
        // tslint:disable-next-line:no-magic-numbers for coord initialisation
        const insideCoord = { x: 5, y: 5 };
        const result = service.processMouseDown(selectedBox, insideCoord);
        expect(selectedBoxNextSpy).toHaveBeenCalled();
        expect(result).toBeTrue();
    });

    it('a click outside the box should not call next on the selectedBox subject and return false', () => {
        // tslint:disable-next-line:no-magic-numbers for coord initialisation
        const outsideCoord = { x: 50, y: 50 };
        const result = service.processMouseDown(selectedBox, outsideCoord);
        expect(selectedBoxNextSpy).not.toHaveBeenCalled();
        expect(result).toBeFalse();
    });

    it('a click inside an anchor should call next on the anchor subject and return true', () => {
        // tslint:disable-next-line:no-magic-numbers for coord initialisation
        const width = 10;
        const height = 20;
        const anchor = selectedBox.anchors.get(AnchorsPosition.middleRight) as Anchor;
        anchor.centerCoord = { x: width, y: height / 2 };
        const insideCoord = { x: width - 1, y: height / 2 + 2 };
        const result = service.processMouseDown(selectedBox, insideCoord);
        expect(selectedBoxNextSpy).not.toHaveBeenCalled();
        expect(anchorNextSpy).toHaveBeenCalled();
        expect(result).toBeTrue();
    });
});
