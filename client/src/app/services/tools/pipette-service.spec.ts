import { TestBed } from '@angular/core/testing';
import { PipetteService } from './pipette-service';

describe('PipetteServiceService', () => {
    let service: PipetteService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PipetteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
