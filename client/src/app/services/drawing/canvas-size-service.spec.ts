import { TestBed } from '@angular/core/testing';
import { CanvasSizeService } from './canvas-size-service';

describe('ResizingService', () => {
    let service: CanvasSizeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasSizeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
