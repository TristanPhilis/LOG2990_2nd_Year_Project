import { HttpClientModule } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingsDataService } from '@app/services/index/drawings-data.service';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('DrawingsDataService', () => {
    let service: DrawingsDataService;
    let indexServiceSpy: SpyObj<IndexService>;
    const testDrawings: DrawingInfo[] = [
        { id: 996, name: 'one', tags: ['firstTag'], metadata: '' },
        { id: 997, name: 'two', tags: [], metadata: '' },
        { id: 998, name: 'three', tags: ['firstTag', 'secondTag'], metadata: '' },
    ];

    beforeEach(
        waitForAsync(() => {
            indexServiceSpy = jasmine.createSpyObj('IndexService', ['getDrawing', 'getAllDrawings', 'postDrawing', 'deleteDrawing']);
            indexServiceSpy.getAllDrawings.and.returnValue(of(testDrawings));
            indexServiceSpy.getDrawing.and.returnValue(of(testDrawings[0]));
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientModule, MatDialogModule, BrowserModule, BrowserAnimationsModule],
                providers: [{ provide: IndexService, useValue: indexServiceSpy }],
            });
        }),
    );

    beforeEach(() => {
        service = TestBed.inject(DrawingsDataService);
        service.drawingsInfo.next(testDrawings);
        service.filteredDrawings = [];
        service.tags = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call index.getAllDrawings() and subscribe when calling getAllDrawings()', () => {
        service.getAllDrawings();
        expect(indexServiceSpy.getAllDrawings).toHaveBeenCalled();
        expect(service.drawingsInfo.value).toEqual(testDrawings);
    });

    it('should get rightPosition', () => {
        expect(service.getDrawingPosition(service.drawingCounter - 1, service.drawingsInfo?.value)).toEqual(service.drawingsInfo?.value.length - 1);
        service.drawingCounter = service.drawingsInfo?.value.length - 1;
        expect(service.getDrawingPosition(service.drawingCounter + 1, service.drawingsInfo?.value)).toEqual(0);
    });

    it('should go to previousDrawing', () => {
        service.drawingCounter = 0;
        service.goToPreviousDrawing();
        expect(service.drawingCounter).toEqual(service.drawingsInfo.value.length - 1);
        service.goToPreviousDrawing();
        expect(service.drawingCounter).toEqual(service.drawingsInfo.value.length - 2);
    });

    it('should go to nextDrawing', () => {
        service.drawingCounter = service.drawingsInfo.value.length - 1;
        service.goToNextDrawing();
        expect(service.drawingCounter).toEqual(0);
        service.goToNextDrawing();
        expect(service.drawingCounter).toEqual(1);
    });

    it('should handle zero, one or two drawings', () => {
        const secondTestDrawings: DrawingInfo[] = [
            { id: 996, name: 'one', tags: ['firstTag'], metadata: '' },
            { id: 997, name: 'two', tags: [], metadata: '' },
            { id: 998, name: 'three', tags: ['firstTag', 'secondTag'], metadata: '' },
        ];
        secondTestDrawings.pop();
        service.drawingsInfo.next(secondTestDrawings);
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([secondTestDrawings[1], secondTestDrawings[0]]);
        secondTestDrawings.pop();
        service.drawingsInfo.next(secondTestDrawings);
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([secondTestDrawings[0]]);
        secondTestDrawings.pop();
        service.drawingsInfo.next(secondTestDrawings);
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([]);
    });

    it('should iterate currentDrawings through filteredDrawings if tags are in', () => {
        service.tags.push('firstTag');
        service.filteredDrawings = [
            { id: 998, name: 'three', tags: ['firstTag', 'secondTag'], metadata: '' },
            { id: 996, name: 'one', tags: ['firstTag'], metadata: '' },
            { id: 995, name: 'one', tags: ['firstTag'], metadata: '' },
        ];
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([service.filteredDrawings[2], service.filteredDrawings[0], service.filteredDrawings[1]]);
        service.filteredDrawings.pop();
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([service.filteredDrawings[1], service.filteredDrawings[0]]);
        service.filteredDrawings.pop();
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([service.filteredDrawings[0]]);
        service.filteredDrawings.pop();
        service.updateCurrentDrawings();
        expect(service.currentDrawings).toEqual([]);
    });

    it('should only add unique tag', () => {
        service.tagInput.setValue('newTag');
        service.addTag();
        expect(service.tags).toEqual(['newTag']);
        service.tagInput.setValue('newTag');
        service.addTag();
        expect(service.tags).toEqual(['newTag']);
    });

    it('can delete existing tags', () => {
        const newTag = 'test';
        service.tags = [newTag];
        service.deleteTag(newTag);
        expect(service.tags.length).toEqual(0);
    });

    it('should delete drawing ', () => {
        // tslint:disable-next-line: no-magic-numbers
        service.deleteDrawing(998);
        service.drawingsInfo.next(service.drawingsInfo.value);
        expect(indexServiceSpy.deleteDrawing).toHaveBeenCalled();
    });
});
