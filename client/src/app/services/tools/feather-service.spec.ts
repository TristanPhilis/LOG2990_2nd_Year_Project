/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { FeatherService } from './feather-service';

describe('Service: Feather', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FeatherService],
        });
    });

    it('should ...', inject([FeatherService], (service: FeatherService) => {
        expect(service).toBeTruthy();
    }));
});
