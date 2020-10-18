import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';

import SpyObj = jasmine.SpyObj;
import { MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let indexServiceSpy: SpyObj<IndexService>;
    const testDrawings: DrawingInfo[] = [{ id: 996, name: '', tags: [], metadata: '' }];

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['getDrawing', 'getAllDrawings', 'postDrawing', 'deleteDrawing']);
        indexServiceSpy.getAllDrawings.and.returnValue(of(testDrawings));
        indexServiceSpy.getDrawing.and.returnValue(of(testDrawings[0]));
        /*indexServiceSpy.sendDrawing.and.returnValue(of());
        indexServiceSpy.deleteDrawing.and.returnValue(of());*/

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule, BrowserModule, BrowserAnimationsModule],
            declarations: [CarouselComponent],
            providers: [{ provide: IndexService, useValue: indexServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        const newDrawing: DrawingInfo = {
            id: 995,
            name: 'newDraw',
            tags: ['one'],
            metadata: '',
        };
        for (let i = 0; i < 3; i++) {
            component.drawingsInfo.value.push(newDrawing);
        }
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call index.sendDrawing() when calling sendDrawing()', () => {
        component.sendDrawing();
        expect(indexServiceSpy.postDrawing).toHaveBeenCalled();
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
        console.log(component.drawingsInfo.value);
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
