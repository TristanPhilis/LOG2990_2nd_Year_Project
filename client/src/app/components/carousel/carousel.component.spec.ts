import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { of } from 'rxjs';
import { CarouselComponent } from './carousel.component';
import SpyObj = jasmine.SpyObj;

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    const testDrawings: DrawingInfo[] = [{ id: 996, name: '', tags: [], metadata: '' }];

    beforeEach(
        waitForAsync(() => {
            indexServiceSpy = jasmine.createSpyObj('IndexService', ['getDrawing', 'getAllDrawings', 'postDrawing', 'deleteDrawing']);
            indexServiceSpy.getAllDrawings.and.returnValue(of(testDrawings));
            indexServiceSpy.getDrawing.and.returnValue(of(testDrawings[0]));

            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule, MatDialogModule, BrowserModule, BrowserAnimationsModule],
                declarations: [CarouselComponent],
                providers: [{ provide: IndexService, useValue: indexServiceSpy }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        const newDrawing: DrawingInfo = {
            id: 995,
            name: 'newDraw',
            tags: ['one'],
            metadata: '',
        };
        // tslint:disable-next-line: no-magic-numbers
        for (let i = 0; i < 3; i++) {
            component.drawingsInfo.value.push(newDrawing);
        }
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call index.getAllDrawings() and subscribe when calling getAllDrawings()', () => {
        component.getAllDrawings();
        expect(indexServiceSpy.getAllDrawings).toHaveBeenCalled();
        expect(component.drawingsInfo.value).toEqual(testDrawings);
    });

    it('should call index.deleteDrawing() when calling deleteDrawing()', () => {
        component.deleteDrawing(1);
        expect(indexServiceSpy.deleteDrawing).toHaveBeenCalledWith(1);
    });

    it('should get rightPosition', () => {
        expect(component.getDrawingPosition(component.drawingCounter - 1)).toEqual(component.drawingsInfo.value.length - 1);
        component.drawingCounter = component.drawingsInfo.value.length - 1;
        expect(component.getDrawingPosition(component.drawingCounter + 1)).toEqual(0);
    });

    it('should go to previousDrawing', () => {
        component.drawingCounter = 0;
        component.goToPreviousDrawing();
        expect(component.drawingCounter).toEqual(component.drawingsInfo.value.length - 1);
        component.goToPreviousDrawing();
        expect(component.drawingCounter).toEqual(component.drawingsInfo.value.length - 2);
    });

    it('should go to nextDrawing', () => {
        component.drawingCounter = component.drawingsInfo.value.length - 1;
        component.goToNextDrawing();
        expect(component.drawingCounter).toEqual(0);
        component.goToNextDrawing();
        expect(component.drawingCounter).toEqual(1);
    });
});
