import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CarouselService } from '@app/services/carousel/carousel-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { CarouselComponent } from './carousel.component';
import SpyObj = jasmine.SpyObj;

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let carouselServiceSpy: SpyObj<CarouselService>;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(
        waitForAsync(() => {
            carouselServiceSpy = jasmine.createSpyObj('CarouselService', [
                'getAllDrawings',
                'updateCurrentDrawings',
                'deleteDrawing',
                'getDrawingPosition',
                'goToPreviousDrawing',
                'goToNextDrawing',
                'addTag',
                'deleteTag',
            ]);
            carouselServiceSpy.tagInput = new FormControl();

            drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'sendDrawing', 'loadDrawing']);

            TestBed.configureTestingModule({
                imports: [
                    RouterTestingModule,
                    MatDialogModule,
                    BrowserModule,
                    BrowserAnimationsModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    ReactiveFormsModule,
                    FormsModule,
                ],
                providers: [
                    { provide: CarouselService, useValue: carouselServiceSpy },
                    { provide: DrawingService, useValue: drawingServiceSpy },
                ],
                declarations: [CarouselComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        carouselServiceSpy.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
        carouselServiceSpy.drawingsInfo.next([{ id: 0, name: '', tags: [], metadata: '' }]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call carousel-service methods', () => {
        component.addTag();
        expect(carouselServiceSpy.addTag).toHaveBeenCalled();
        component.deleteTag('tag');
        expect(carouselServiceSpy.deleteTag).toHaveBeenCalledWith('tag');
        component.goToPreviousDrawing();
        expect(carouselServiceSpy.goToPreviousDrawing).toHaveBeenCalled();
        component.goToNextDrawing();
        expect(carouselServiceSpy.goToNextDrawing).toHaveBeenCalled();
        component.getDrawingPosition(0);
        carouselServiceSpy.tags = [''];
        component.getDrawingPosition(0);
        expect(carouselServiceSpy.getDrawingPosition).toHaveBeenCalled();
        component.deleteDrawing(0);
        expect(carouselServiceSpy.deleteDrawing).toHaveBeenCalledWith(0);
    });

    it('should call drawingService methods', () => {
        // Testing a private method (sendDrawingToEditor)
        // tslint:disable-next-line: no-any
        (component as any).sendDrawingToEditor(true, carouselServiceSpy.drawingsInfo.value[0]);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawingServiceSpy.sendDrawing).toHaveBeenCalled();
    });
});
