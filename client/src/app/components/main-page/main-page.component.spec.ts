import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MainPageComponent } from './main-page.component';

// tslint:disable:no-any
describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(
        waitForAsync(() => {
            dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
            drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'sendDrawing', 'fillCanvas']);

            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule, MatDialogModule, BrowserModule, BrowserAnimationsModule],
                providers: [
                    { provide: DrawingService, useValue: drawingServiceSpy },
                    { provide: MatDialog, useValue: dialogSpy },
                ],
                declarations: [MainPageComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('createNew should have been call', () => {
        component.createNew();
        expect(drawingServiceSpy.drawingToLoad).toEqual('');
    });
    it('openCarousel should have been call', () => {
        component.openCarousel();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('openGuide should have been call', () => {
        component.openGuide();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('continueDrawing should have been call', () => {
        component.continueDrawing();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawingServiceSpy.fillCanvas).toHaveBeenCalled();
        expect(drawingServiceSpy.sendDrawing).toHaveBeenCalled();
    });
});
