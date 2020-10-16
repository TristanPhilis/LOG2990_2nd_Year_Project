import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { SavePopupComponent } from './save-popup.component';

describe('SavePopupComponent', () => {
    let component: SavePopupComponent;
    let fixture: ComponentFixture<SavePopupComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let webRequestServiceSpy: jasmine.SpyObj<IndexService>;

    beforeEach(async(() => {
        webRequestServiceSpy = jasmine.createSpyObj('IndexService', ['postDrawing']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['getImageURL']);
        TestBed.configureTestingModule({
            declarations: [SavePopupComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: IndexService, useValue: webRequestServiceSpy },
            ],
            imports: [FormsModule, ReactiveFormsModule],
        }).compileComponents();
    }));

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
        const expectedDrawingInfo = {
            id: -1,
            name,
            tags,
            metadata: imageURL,
        };
        component.saveDrawing();
        expect(webRequestServiceSpy.postDrawing).toHaveBeenCalledWith(expectedDrawingInfo);
    });
});
