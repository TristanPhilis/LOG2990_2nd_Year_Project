import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ValidatorService } from './validator-service';

describe('ValidatorService.TsService', () => {
    let service: ValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isNumberValidator should return null if it is a number', () => {
        const numberFunction = service.isNumber();
        expect(numberFunction(new FormControl('5'))).toBeNull();
    });

    it('isNumberValidator should not accept hex values', () => {
        const numberFunction = service.isNumber();
        expect(numberFunction(new FormControl('AF5E'))).toEqual({ input: 'AF5E' });
    });

    it('hexColorValidator should return null if valid color', () => {
        const hexColorValidator = service.isValidHexColor();
        expect(hexColorValidator(new FormControl('AF5E'))).toBeNull();
        expect(hexColorValidator(new FormControl('FFFFFF'))).toBeNull();
        expect(hexColorValidator(new FormControl('0'))).toBeNull();
    });

    it('hexColorValidator should return object if invalid color', () => {
        const hexColorValidator = service.isValidHexColor();
        expect(hexColorValidator(new FormControl('-1'))).toEqual({ input: '-1' });
        expect(hexColorValidator(new FormControl('FFFFFFF'))).toEqual({ input: 'FFFFFFF' });
        expect(hexColorValidator(new FormControl('FA3G86'))).toEqual({ input: 'FA3G86' });
    });
});
