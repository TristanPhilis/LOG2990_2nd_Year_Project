import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CreateNewDrawingComponent } from './create-new-drawing.component';

describe('CreateNewDrawingComponent', () => {
    let component: CreateNewDrawingComponent;
    let fixture: ComponentFixture<CreateNewDrawingComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            declarations: [CreateNewDrawingComponent],
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
            imports: [MatDialogModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateNewDrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call clearCanvas when clearCanvas is called', () => {
        component.clearCanvas();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledTimes(2);
    });
});
