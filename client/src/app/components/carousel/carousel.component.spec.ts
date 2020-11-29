import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingsDataService } from '@app/services/index/drawings-data.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { CarouselComponent } from './carousel.component';
import SpyObj = jasmine.SpyObj;

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let drawingsDataServiceSpy: SpyObj<DrawingsDataService>;
    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(
        waitForAsync(() => {
            drawingsDataServiceSpy = jasmine.createSpyObj('DrawingsDataService', [
                'getAllDrawings',
                'updateCurrentDrawings',
                'deleteDrawing',
                'getDrawingPosition',
                'goToPreviousDrawing',
                'goToNextDrawing',
                'addTag',
                'deleteTag',
            ]);
            drawingsDataServiceSpy.tagInput = new FormControl();

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
                    { provide: DrawingsDataService, useValue: drawingsDataServiceSpy },
                    { provide: DrawingService, useValue: drawingServiceSpy },
                ],
                declarations: [CarouselComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        drawingsDataServiceSpy.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
        drawingsDataServiceSpy.drawingsInfo.next([{ id: 0, name: '', tags: [], metadata: '' }]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call drawings-data-service methods', () => {
        component.addTag();
        expect(drawingsDataServiceSpy.addTag).toHaveBeenCalled();
        component.deleteTag('tag');
        expect(drawingsDataServiceSpy.deleteTag).toHaveBeenCalledWith('tag');
        component.goToPreviousDrawing();
        expect(drawingsDataServiceSpy.goToPreviousDrawing).toHaveBeenCalled();
        component.goToNextDrawing();
        expect(drawingsDataServiceSpy.goToNextDrawing).toHaveBeenCalled();
        component.getDrawingPosition(0);
        drawingsDataServiceSpy.tags = [''];
        component.getDrawingPosition(0);
        expect(drawingsDataServiceSpy.getDrawingPosition).toHaveBeenCalled();
        component.deleteDrawing(0);
        expect(drawingsDataServiceSpy.deleteDrawing).toHaveBeenCalledWith(0);
    });

    it('should call drawingService methods', () => {
        // Testing a private method (sendDrawingToEditor)
        // tslint:disable-next-line: no-any
        (component as any).sendDrawingToEditor(true, drawingsDataServiceSpy.drawingsInfo.value[0]);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawingServiceSpy.sendDrawing).toHaveBeenCalled();
    });
});
