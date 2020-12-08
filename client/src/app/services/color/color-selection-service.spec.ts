import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorSelectionService } from './color-selection-service';

describe('ColorSelectionService', () => {
    let service: ColorSelectionService;
    let primaryColor: Color;
    let secondaryColor: Color;
    let colorHistory: Color[];
    let defaultSize: number;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorSelectionService);
        // disabling magic-number to assign random rgb values
        // tslint:disable:no-magic-numbers
        primaryColor = new Color(150, 34, 200);
        secondaryColor = new Color(200, 200, 200);
        let r = 0;
        let g = 0;
        let b = 0;
        defaultSize = 10;
        colorHistory = new Array(defaultSize);
        for (let index = 0; index < defaultSize; index++) {
            colorHistory[index] = new Color(r, g, b);
            r += 10;
            g += 15;
            b += 20;
        }
        // tslint:enable:no-magic-numbers
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('default history should be size 10 and all black', () => {
        const defaultColor = new Color(0, 0, 0);
        const history = service.getColorsHistory();
        expect(history.length).toEqual(defaultSize);
        for (const color of history) {
            expect(color).toEqual(defaultColor);
        }
    });

    it('should update color history properly', () => {
        for (let index = 0; index < service.getColorsHistory().length; index++) {
            service.updateHistory(colorHistory[index]);
        }
        // New color should be inserted at the start
        // 9 8 7 6 5 4 3 2 1 0
        expect(service.getColorsHistory()).toEqual(colorHistory.reverse());
        colorHistory.reverse();
        service.updateHistory(colorHistory[1]);
        // 1 9 8 7 6 5 4 3 2 0
        // Existing color should be inserted at the start, and the rest of the array should shift
        const expectedIndex = 8;
        expect(service.getColorsHistory()[2]).toEqual(colorHistory[expectedIndex]); // everything shifted
        expect(service.getColorsHistory()[0]).toEqual(colorHistory[1]); // inserted at the start
    });

    it('Should swap primary and secondary', () => {
        service.primaryColor = primaryColor;
        service.secondaryColor = secondaryColor;
        service.swap();
        expect(service.primaryColor).toEqual(secondaryColor);
        expect(service.secondaryColor).toEqual(primaryColor);
    });

    it('selectNewColor should change the primary color when second param is true', () => {
        service.selectNewColor(secondaryColor, true);
        expect(service.primaryColor).toEqual(secondaryColor);
    });

    it('selectNewColor should change the secondary color when second param is false', () => {
        service.selectNewColor(primaryColor, false);
        expect(service.secondaryColor).toEqual(primaryColor);
    });
});
