import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { WebRequestService } from '@app/services/index/web-request-service';
import { ExportPopupComponent } from './export-popup.component';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('ExportPopupComponent', () => {
    let component: ExportPopupComponent;
    let fixture: ComponentFixture<ExportPopupComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererMock: jasmine.SpyObj<Renderer2>;
    let canvasSpy: jasmine.SpyObj<HTMLCanvasElement>;
    let anchorSpy: jasmine.SpyObj<HTMLAnchorElement>;
    let ctxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let webRequestServiceSpy: jasmine.SpyObj<WebRequestService>;

    beforeEach(
        waitForAsync(() => {
            // spys for testing the exportDrawing function
            webRequestServiceSpy = jasmine.createSpyObj('WebRequestService', ['postDrawing', 'sendEmail']);
            canvasSpy = jasmine.createSpyObj('HTMLCanvasElement', ['toDataURL', 'getContext'], ['width', 'height']);
            ctxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage', 'clearRect'], ['filter']);
            canvasSpy.getContext.and.returnValue(ctxSpy);
            anchorSpy = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
            rendererMock = jasmine.createSpyObj('Renderer2', ['createElement']);
            rendererMock.createElement.withArgs('canvas').and.returnValue(canvasSpy);
            rendererMock.createElement.withArgs('a').and.returnValue(anchorSpy);

            drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
            drawServiceSpy.canvas = canvasTestHelper.canvas;
            TestBed.configureTestingModule({
                declarations: [ExportPopupComponent],
                providers: [
                    { provide: DrawingService, useValue: drawServiceSpy },
                    { provide: WebRequestService, useValue: webRequestServiceSpy },
                ],
                imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatRadioModule, BrowserAnimationsModule],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['canvasCtx'] = ctxSpy;
        component['renderer'] = rendererMock;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onInit should set default values', () => {
        const setPreviewSizeSpy = spyOn<any>(component, 'setPreviewSize');
        component.ngOnInit();
        expect(component['selectedFilterValue']).toEqual('none');
        expect(component['originalCanvas']).toEqual(component['drawingService'].canvas);
        expect(component.fileType).toEqual('png');
        expect(component.nameInput).toBeTruthy();
        const expectedFilterLenght = 6;
        expect(component.filterOptions.length).toEqual(expectedFilterLenght);
        expect(setPreviewSizeSpy).toHaveBeenCalled();
    });

    it('setPreview should keep the aspect ratio of the picture when wider', () => {
        const width = 1000;
        const height = 200;
        const expectedSize: Vec2 = { x: 250, y: 50 };
        component['originalCanvas'].width = width;
        component['originalCanvas'].height = height;
        (component as any).setPreviewSize();
        expect(component['previewSize']).toEqual(expectedSize);
    });

    it('setPreview should keep the aspect ratio of the picture when taller', () => {
        const width = 200;
        const height = 1000;
        const expectedSize: Vec2 = { x: 50, y: 250 };
        component['originalCanvas'].width = width;
        component['originalCanvas'].height = height;
        (component as any).setPreviewSize();
        expect(component['previewSize']).toEqual(expectedSize);
    });

    it('afterViewInit should draw the preview image', () => {
        const drawImageSpy = spyOn<any>(component.previewCanvas.nativeElement.getContext('2d'), 'drawImage');
        component.ngAfterViewInit();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('updateFilter should change the selected filter and draw new image', () => {
        const applySlectedFilterSpy = spyOn<any>(component, 'applySelectedFilter');
        const filter = 'blur(3px)';
        component.updateFilter(filter);
        expect(component['selectedFilterValue']).toEqual(filter);
        expect(applySlectedFilterSpy).toHaveBeenCalled();
        expect(ctxSpy.drawImage).toHaveBeenCalled();
    });

    it('ApplySelectedFilter should change context filter value', () => {
        const ctx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        const filter = 'blur(3px)';
        component['selectedFilterValue'] = filter;
        component.applySelectedFilter(ctx);
        expect(ctx.filter).toEqual(filter);
        ctx.filter = 'none';
    });

    it('exportDrawing should call toDataURL with the right type', () => {
        const type = ['png', 'jpeg'];
        const expectedType = ['image/png', 'image/jpeg'];
        for (let i = 0; i < 2; i++) {
            component.fileType = type[i];
            component.exportDrawing();
            expect(canvasSpy.toDataURL).toHaveBeenCalledWith(expectedType[i]);
        }
    });

    it('Shoudl apply filter to the final context and draw the original image', () => {
        const applySlectedFilterSpy = spyOn<any>(component, 'applySelectedFilter');
        component.exportDrawing();
        expect(applySlectedFilterSpy).toHaveBeenCalledWith(ctxSpy);
        expect(ctxSpy.drawImage).toHaveBeenCalled();
    });

    it('should call the click method on the created anchor to downlaod the file', () => {
        component.exportDrawing();
        expect(rendererMock.createElement).toHaveBeenCalledTimes(2);
        expect(anchorSpy.click).toHaveBeenCalled();
    });

    it('sendEmail should call toDataURL with the right type', () => {
        const type = ['png', 'jpeg'];
        const expectedType = ['image/png', 'image/jpeg'];
        for (let i = 0; i < 2; i++) {
            component.fileType = type[i];
            component.sendEmail();
            expect(canvasSpy.toDataURL).toHaveBeenCalledWith(expectedType[i]);
        }
    });
});
