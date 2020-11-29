import { TestBed } from '@angular/core/testing';
import { Color } from '@app/classes/color';
import { ColorSelectionService } from './color-selection-service';

describe('ColorSelectionServiceService', () => {
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

    it('default history should be size 10 and all white', () => {
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
        // New color should be inserted at the end
        expect(service.getColorsHistory()).toEqual(colorHistory);
        service.updateHistory(colorHistory[1]);
        // Existing color should be inserted at the end, and the rest of the array should shift
        expect(service.getColorsHistory()[1]).toEqual(colorHistory[2]);
        expect(service.getColorsHistory()[defaultSize - 1]).toEqual(colorHistory[1]);
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
