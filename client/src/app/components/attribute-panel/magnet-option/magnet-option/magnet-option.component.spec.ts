import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GridService } from '@app/services/grid/grid-service';
import { AnchorsPosition } from '@app/shared/enum';
import { MagnetOptionComponent } from './magnet-option.component';

describe('MagnetOptionComponent', () => {
    let component: MagnetOptionComponent;
    let fixture: ComponentFixture<MagnetOptionComponent>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async () => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['toggleMagnetism', 'setAnchor']);
        gridServiceSpy.shouldSnapToGrid = true;
        await TestBed.configureTestingModule({
            declarations: [MagnetOptionComponent],
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetOptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('toggleMagnetism should calls gridService toggleMagnetism', () => {
        component.toggleMagnetism();
        expect(gridServiceSpy.toggleMagnetism).toHaveBeenCalled();
    });

    it('onAnchorClick should call gridService setAnchor function and add selected class to clicked div', () => {
        const div = fixture.debugElement.query(By.css('#center')).nativeElement;
        const anchor = AnchorsPosition.center;
        component.onAnchorClick(div, anchor);
        expect(gridServiceSpy.setAnchor).toHaveBeenCalledWith(anchor);
        expect(div.classList.contains('selected')).toBeTrue();
    });

    it('component should start with one selected div', () => {
        const selectedDivs = fixture.debugElement.queryAll(By.css('.selected'));
        expect(selectedDivs.length).toEqual(1);
    });

    it('RemoveSelectedStyle should remove the class selected on all divs', () => {
        component.removeSelectedStyle();
        const selectedDivs = fixture.debugElement.queryAll(By.css('.selected'));
        expect(selectedDivs.length).toEqual(0);
    });

    it('button text should display "Désactiver" when grid is active', () => {
        const expectedResult = 'Désactiver';
        const result = component.buttonText;
        expect(result).toEqual(expectedResult);
    });

    it('button text should display "Activer" when grid is not active', () => {
        gridServiceSpy.shouldSnapToGrid = false;
        const expectedResult = 'Activer';
        const result = component.buttonText;
        expect(result).toEqual(expectedResult);
    });

    it('AnchorsPosition should return the enum', () => {
        const result = component.AnchorsPosition;
        expect(result).toEqual(AnchorsPosition);
    });
});
