import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IndexService } from '@app/services/index/index.service';

import SpyObj = jasmine.SpyObj;
import { MatDialogModule } from '@angular/material/dialog';
import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let indexServiceSpy: SpyObj<IndexService>;

    beforeEach(async(() => {
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['getDrawing', 'getAllDrawings', 'postDrawing', 'deleteDrawing']);
        /*indexServiceSpy.getDrawing.and.returnValue(of({ id: '', name: '', tags: [], metadata: '' }));
        indexServiceSpy.getAllDrawings.and.returnValue(of({ id: '', name: '', tags: [], metadata: '' }));
        indexServiceSpy.sendDrawing.and.returnValue(of());
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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call index.sendDrawing() when calling sendDrawing()', () => {
        component.sendDrawing();
        expect(indexServiceSpy.postDrawing).toHaveBeenCalled();
    });

    it('should call index.getAllDrawings() when calling getAllDrawings()', () => {
        component.getAllDrawings();
        expect(indexServiceSpy.getAllDrawings).toHaveBeenCalled();
    });

    it('should call index.deleteDrawing() when calling deleteDrawing()', () => {
        component.deleteDrawing(1);
        expect(indexServiceSpy.deleteDrawing).toHaveBeenCalledWith(1);
    });
});
