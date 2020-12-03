import { TestBed } from '@angular/core/testing';
import { MagicSelectorService } from './magic-selector-service';

describe('MagicSelectorService', () => {
    let service: MagicSelectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MagicSelectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
