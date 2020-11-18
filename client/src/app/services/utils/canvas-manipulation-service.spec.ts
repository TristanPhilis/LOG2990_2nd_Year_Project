import { TestBed } from '@angular/core/testing';
import { CanvasManipulationService } from './canvas-manipulation-service';

describe('CanvasManipulationService', () => {
    let service: CanvasManipulationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasManipulationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
