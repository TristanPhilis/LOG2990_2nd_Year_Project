import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { WebRequestService } from '@app/services/index/web-request-service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { SavePopupComponent } from './save-popup.component';

describe('SavePopupComponent', () => {
    let component: SavePopupComponent;
    let fixture: ComponentFixture<SavePopupComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let webRequestServiceSpy: jasmine.SpyObj<WebRequestService>;

    beforeEach(
        waitForAsync(() => {
            webRequestServiceSpy = jasmine.createSpyObj('IndexService', ['postDrawing', 'getAllDrawings']);
            drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['getImageURL']);
            TestBed.configureTestingModule({
                declarations: [SavePopupComponent],
                providers: [
                    { provide: DrawingService, useValue: drawingServiceSpy },
                    { provide: WebRequestService, useValue: webRequestServiceSpy },
                ],
                imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatIconModule, BrowserAnimationsModule],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(SavePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should initialize properly', () => {
        component.ngOnInit();
        expect(component.nameInput).toBeTruthy();
        expect(component.tagInput).toBeTruthy();
        expect(component.tags).toBeTruthy();
    });

    it('Should add a tag to the array', () => {
        const newTag = 'test';
        component.tagInput.setValue(newTag);
        component.addTag();
        expect(component.tags[0]).toEqual(newTag);
    });

    it('Should not add new tag if tag is already present', () => {
        const newTag = 'test';
        component.tagInput.setValue(newTag);
        component.addTag();
        component.tagInput.setValue(newTag);
        component.addTag();
        expect(component.tags.length).toEqual(1);
    });

    it('can delete existing tags', () => {
        const newTag = 'test';
        component.tags = [newTag];
        component.deleteTag(newTag);
        expect(component.tags.length).toEqual(0);
    });

    it('saveDrawing should call the http request service post method', () => {
        const name = 'drawing';
        component.nameInput.setValue(name);
        const imageURL = 'testImageURL';
        const tags = ['tag'];
        component.tags = tags;
        drawingServiceSpy.getImageURL.and.returnValue(imageURL);
        const expectedDrawing: DrawingInfo = {
            id: webRequestServiceSpy.nextDrawingId,
            name: component.nameInput.value.toString(),
            tags: component.tags,
            metadata: drawingServiceSpy.getImageURL(),
        };
        component.saveDrawing();
        expect(webRequestServiceSpy.postDrawing).toHaveBeenCalledWith(expectedDrawing);
    });
});
