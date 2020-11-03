import { inject, TestBed } from '@angular/core/testing';
import { UndoRedoService } from './undoRedo-service';

describe('Service: UndoRedo', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UndoRedoService],
        });
    });

    it('should ...', inject([UndoRedoService], (service: UndoRedoService) => {
        expect(service).toBeTruthy();
    }));
});
