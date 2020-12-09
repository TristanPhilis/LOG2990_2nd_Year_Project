import { TestBed } from '@angular/core/testing';
import { ShortcutService } from './shortcut-service';

describe('ShortcutService', () => {
    let service: ShortcutService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ShortcutService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('if shortcut disabled, execute should return early', () => {
        service.shortcutsEnabled = false;
        const getSpy = spyOn(service.shortcuts, 'get');
        service.execute('d');
        expect(getSpy).not.toHaveBeenCalled();
    });
});
