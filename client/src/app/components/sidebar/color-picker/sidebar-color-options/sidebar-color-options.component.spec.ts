import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Color } from '@app/classes/color';
import { ColorPickerComponent } from '@app/components/sidebar/color-picker/color-picker.component';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { MouseButton } from '@app/shared/enum';
import { of } from 'rxjs';
import { SidebarColorOptionsComponent } from './sidebar-color-options.component';

describe('SidebarColorOptionsComponent', () => {
    let component: SidebarColorOptionsComponent;
    let fixture: ComponentFixture<SidebarColorOptionsComponent>;
    let colorSelectionServiceSpy: jasmine.SpyObj<ColorSelectionService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<ColorPickerComponent>>;
    let defaultColor: Color;
    beforeEach(
        waitForAsync(() => {
            defaultColor = new Color(0, 0, 0);
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
            dialogSpy.open.and.returnValue(dialogRefSpyObj);

            colorSelectionServiceSpy = jasmine.createSpyObj(
                'ColorSelectionService',
                ['updateHistory', 'selectNewColor', 'getcolorsHistory', 'swap'],
                {
                    primaryColor: defaultColor,
                    secondaryColor: defaultColor,
                },
            );
            TestBed.configureTestingModule({
                declarations: [SidebarColorOptionsComponent],
                imports: [MatDialogModule, BrowserAnimationsModule],
                providers: [
                    { provide: MatDialog, useValue: dialogSpy },
                    { provide: ColorSelectionService, useValue: colorSelectionServiceSpy },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarColorOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openColorPicker should open the colorPicker dialog', () => {
        dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        component.openColorPicker(true);
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('Selecting a new color from the color picker should update history and selected color of primary color', () => {
        dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(defaultColor), close: null });
        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        component.openColorPicker(true);
        expect(colorSelectionServiceSpy.updateHistory).toHaveBeenCalled();
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(defaultColor, true);
    });

    it('Selecting a new color from the color picker should update history and selected color of secondary color', () => {
        dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(defaultColor), close: null });
        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        component.openColorPicker(false);
        expect(colorSelectionServiceSpy.updateHistory).toHaveBeenCalled();
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(defaultColor, false);
    });

    it('Not selecting a new color from the color picker (cancel) should update history and selected color', () => {
        dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(), close: null });
        dialogSpy.open.and.returnValue(dialogRefSpyObj);
        component.openColorPicker(true);
        expect(colorSelectionServiceSpy.updateHistory).not.toHaveBeenCalled();
        expect(colorSelectionServiceSpy.selectNewColor).not.toHaveBeenCalled();
    });

    it('Swap should call the color service swap', () => {
        component.swap();
        expect(colorSelectionServiceSpy.swap).toHaveBeenCalled();
    });

    it('Changing the alpha value should change the color service primary color', () => {
        const expectedColor = new Color(0, 0, 0, 0);
        const event = {
            target: {
                ValueAsNumber: 0,
            },
        };
        component.onAlphaChange(event, true);
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(expectedColor, true);
    });

    it('Changing the alpha value should change the color service secondary color', () => {
        const expectedColor = new Color(0, 0, 0, 0);
        const event = {
            target: {
                ValueAsNumber: 0,
            },
        };
        component.onAlphaChange(event, false);
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(expectedColor, false);
    });

    it('left clicking on a color should update the history and primary color', () => {
        const leftClick = {
            buttons: MouseButton.Left,
        } as MouseEvent;
        component.onHistoryColorSelected(leftClick, defaultColor);
        expect(colorSelectionServiceSpy.updateHistory).toHaveBeenCalledWith(defaultColor);
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(defaultColor, true);
    });

    it('right clicking on a color should update the history and secondary color', () => {
        const rightClick = {
            buttons: MouseButton.Right,
        } as MouseEvent;
        component.onHistoryColorSelected(rightClick, defaultColor);
        expect(colorSelectionServiceSpy.updateHistory).toHaveBeenCalledWith(defaultColor);
        expect(colorSelectionServiceSpy.selectNewColor).toHaveBeenCalledWith(defaultColor, false);
    });
});
