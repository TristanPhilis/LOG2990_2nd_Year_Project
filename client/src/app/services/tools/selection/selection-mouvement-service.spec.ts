import { TestBed } from '@angular/core/testing';
import { SelectionMouvementService } from './selection-mouvement-service';

describe('SelectionMouvementService', () => {
    let service: SelectionMouvementService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectionMouvementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
