import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';
import { GridService } from '@app/services/grid/grid-service';
import { GridOptionsComponent } from './grid-options.component';

describe('GridOptionsComponent', () => {
    let component: GridOptionsComponent;
    let fixture: ComponentFixture<GridOptionsComponent>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async () => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['toggleGrid', 'onOptionChange']);
        await TestBed.configureTestingModule({
            declarations: [GridOptionsComponent],
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
            imports: [MatSliderModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GridOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('updateSize should change the gridService sqareSize value and call onOptionChange', () => {
        const inputValue = 5;
        component.updateSize(inputValue);
        expect(gridServiceSpy.squareSize).toEqual(inputValue);
        expect(gridServiceSpy.onOptionChange).toHaveBeenCalled();
    });

    it('updateTransparency should change the gridService transparency value and call onOptionChange', () => {
        const inputValue = 70;
        const expectedResult = 0.7;
        component.updateTransparency(inputValue);
        expect(gridServiceSpy.transparency).toBeCloseTo(expectedResult, 2);
        expect(gridServiceSpy.onOptionChange).toHaveBeenCalled();
    });

    it('formatSize should return the right string', () => {
        const input = 34;
        const expectedResult = '34px';
        const result = component.formatSize(input);
        expect(result).toEqual(expectedResult);
    });

    it('formatTransparency should return the right string', () => {
        const input = 34;
        const expectedResult = '34%';
        const result = component.formatTransparency(input);
        expect(result).toEqual(expectedResult);
    });

    it('ToggleGrid should call gridService toggleGrid', () => {
        component.toggleGrid();
        expect(gridServiceSpy.toggleGrid).toHaveBeenCalled();
    });

    it('button text should display "Enlever" when grid is active', () => {
        component.gridService.isShown = true;
        const expectedResult = 'Enlever';
        const result = component.buttonText;
        expect(result).toEqual(expectedResult);
    });

    it('button text should display "Afficher" when grid is not active', () => {
        component.gridService.isShown = false;
        const expectedResult = 'Afficher';
        const result = component.buttonText;
        expect(result).toEqual(expectedResult);
    });
});
