import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color, MAX_RGBA_VALUE } from '@app/classes/color';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { A_POSITION, B_POSITION, G_POSITION, PIXEL_INTERVAL, R_POSITION } from '@app/shared/constant';
import { SearchHelper } from '@app/utils/search-helper';
import { MagicSelectorService } from './magic-selector-service';

describe('MagicSelectorService', () => {
    let service: MagicSelectorService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let pixelNumber: number;
    let canvasSize: Vec2;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getImageData', 'setImageData', 'isCoordInCanvas']);
        drawServiceSpy.getImageData.and.returnValue(new ImageData(1, 1));
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(MagicSelectorService);
        const size = 100;
        canvasTestHelper.canvas.width = size;
        canvasTestHelper.canvas.height = size;
        canvasSize = { x: canvasTestHelper.canvas.width, y: canvasTestHelper.canvas.height };
        pixelNumber = canvasSize.x * canvasSize.y * PIXEL_INTERVAL;
        // initalizing the canvas and ctx
        // tslint:disable:no-string-literal lots of private member acces
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['canvasSize'] = canvasSize;
        service['pixelsData'] = new Uint8ClampedArray(pixelNumber).fill(0);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawSelectionBox should do nothing', () => {
        service.drawSelectionBox({} as SelectionBox, true);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    // tslint:disable:no-any needs spy on many private methods
    it('copy area should return a valid selectionImageData', () => {
        const getFinalImageDataSpy = spyOn<any>(service, 'getFinalImageData');
        const getContourImageSpy = spyOn<any>(service, 'getContourImage');
        const result = service.copyArea({} as SelectedBox);
        expect(result).toBeTruthy();
        expect(getFinalImageDataSpy).toHaveBeenCalled();
        expect(getContourImageSpy).toHaveBeenCalled();
    });

    it('clearInitialSelectedZone should get the image data from the drawing service, change it, and place it back', () => {
        const lenght = 8;
        const selectionImageDataStub = {
            initialSelectedPixels: new Array<number>(lenght),
        } as SelectionImageData;

        service.clearInitialSelectedZone(selectionImageDataStub);
        expect(drawServiceSpy.getImageData).toHaveBeenCalled();
        expect(drawServiceSpy.setImageData).toHaveBeenCalled();
    });

    it('executeMagicSelection with leftClick should start bfs', () => {
        const bfsSpy = spyOn<any>(service, 'beginBFS');
        const linearSearchSpy = spyOn<any>(service, 'beginLinearSearch');
        const coord = { x: 0, y: 0 };
        service.executeMagicSelection(coord, true);
        expect(bfsSpy).toHaveBeenCalled();
        expect(linearSearchSpy).not.toHaveBeenCalled();
    });

    it('executeMagicSelection with rightClick should start linear search', () => {
        const bfsSpy = spyOn<any>(service, 'beginBFS');
        const linearSearchSpy = spyOn<any>(service, 'beginLinearSearch');
        const coord = { x: 0, y: 0 };
        service.executeMagicSelection(coord, false);
        expect(bfsSpy).not.toHaveBeenCalled();
        expect(linearSearchSpy).toHaveBeenCalled();
    });

    it('getFinalImage should use the fillCtx to place the matching pixels on canvas and return the ones in the seleced zone', () => {
        (service as any).initializeCanvas();
        const putDataSpy = spyOn(service['fillCtx'], 'putImageData');
        const getDataSpy = spyOn(service['fillCtx'], 'getImageData');
        const box = service['boundingBox'];
        (service as any).getFinalImageData();
        expect(putDataSpy).toHaveBeenCalled();
        expect(getDataSpy).toHaveBeenCalledWith(box.position.x, box.position.y, box.width + 1, box.height + 1);
    });

    it('getContourImage should use the contourCtx to place the matching pixels on canvas and get the ones in the seleced zone', () => {
        (service as any).initializeCanvas();
        const putDataSpy = spyOn(service['contoursCtx'], 'putImageData');
        const getDataSpy = spyOn(service['contoursCtx'], 'getImageData');
        getDataSpy.and.returnValue(new ImageData(1, 1));
        const box = service['boundingBox'];
        (service as any).getContourImage();
        expect(putDataSpy).toHaveBeenCalled();
        expect(getDataSpy).toHaveBeenCalledWith(box.position.x, box.position.y, box.width, box.height);
    });

    it('linearSearch should check all pixels and update bounding box if it is same color', () => {
        const colorSpyObj = jasmine.createSpyObj('Color', ['equal']);
        colorSpyObj.equal.and.returnValue(true);
        spyOn(SearchHelper, 'getColorFromIndex').and.returnValue(colorSpyObj);
        const fillPixelSpy = spyOn<any>(service, 'fillPixelsAtCoord');
        const checkforEdges = spyOn<any>(service, 'checkForEdges');
        (service as any).beginLinearSearch();
        const expectedCalls = pixelNumber / PIXEL_INTERVAL;
        expect(colorSpyObj.equal).toHaveBeenCalledTimes(expectedCalls);
        expect(fillPixelSpy).toHaveBeenCalledTimes(expectedCalls);
        expect(checkforEdges).toHaveBeenCalledTimes(expectedCalls);
    });

    it('linearSearch should check all pixels and do nothing if no match ', () => {
        const colorSpyObj = jasmine.createSpyObj('Color', ['equal']);
        colorSpyObj.equal.and.returnValue(false);
        spyOn(SearchHelper, 'getColorFromIndex').and.returnValue(colorSpyObj);
        const fillPixelSpy = spyOn<any>(service, 'fillPixelsAtCoord');
        const checkforEdges = spyOn<any>(service, 'checkForEdges');
        (service as any).beginLinearSearch();
        const expectedCalls = pixelNumber / PIXEL_INTERVAL;
        expect(colorSpyObj.equal).toHaveBeenCalledTimes(expectedCalls);
        expect(fillPixelSpy).not.toHaveBeenCalled();
        expect(checkforEdges).not.toHaveBeenCalled();
    });

    it('bfs search should work', () => {
        const startingCoord = { x: 1, y: 1 };
        service['colorToMatch'] = new Color(0, 0, MAX_RGBA_VALUE);
        service['visitedPixels'] = new Array(pixelNumber).fill(false);
        drawServiceSpy.isCoordInCanvas.and.returnValue(true);
        const fill = (index: number) => {
            service['pixelsData'][index + B_POSITION] = MAX_RGBA_VALUE;
            service['pixelsData'][index + A_POSITION] = MAX_RGBA_VALUE;
        };
        // tslint:disable:no-magic-numbers
        // disabling magic number for easy color index acces for neighboor pixels
        fill(0); //    0*    4     8    12
        fill(400); //  400*  404*  408  412  starting coord = 404
        fill(800); //  800*  804   808  812
        fill(1200); // 1200* 1204  1208 1212*
        fill(1212);
        // tslint:enable:no-magic-numbers
        const checkforEdges = spyOn<any>(service, 'checkForEdges');
        const fillPixelSpy = spyOn<any>(service, 'fillPixelsAtCoord');
        const expectedCalls = 5;
        (service as any).beginBFS(startingCoord);
        expect(fillPixelSpy).toHaveBeenCalledTimes(expectedCalls);
        expect(checkforEdges).toHaveBeenCalledTimes(expectedCalls);
    });

    it('fillPixelsAtCoord should update the matching image data at the specified coord', () => {
        const coord = { x: 1, y: 1 };
        const pixelIndex = 404;
        const bValue = 67;
        service['colorToMatch'] = new Color(0, 0, bValue);
        service['matchingImageData'] = new ImageData(canvasSize.x, canvasSize.y);
        (service as any).fillPixelsAtCoord(coord);
        expect(service['matchingImageData'].data[pixelIndex + B_POSITION]).toEqual(bValue);
        expect(service['matchingImageData'].data[pixelIndex + A_POSITION]).toEqual(MAX_RGBA_VALUE);
    });

    it('checkForedges should fill contourImagaData with black when a pixel is on the edge', () => {
        const startingCoord = { x: 1, y: 1 };
        service['colorToMatch'] = new Color(0, 0, MAX_RGBA_VALUE);
        service['contourImageData'] = new ImageData(canvasSize.x, canvasSize.y);
        drawServiceSpy.isCoordInCanvas.and.returnValue(true);
        const fill = (index: number) => {
            service['pixelsData'][index + B_POSITION] = MAX_RGBA_VALUE;
            service['pixelsData'][index + A_POSITION] = MAX_RGBA_VALUE;
        };
        // tslint:disable:no-magic-numbers
        // disabling magic number for easy color index acces for neighboor pixels
        fill(0); //    0*    4     8*    12
        fill(400); //  400*  404*  408   412  starting coord = 404
        fill(800); //  800*  804*  808   812
        fill(1200); // 1200* 1204  1208  1212*
        fill(8);
        fill(804);
        const expectedBlackedPixels = [4, 408, 808, 404];
        // tslint:enable:no-magic-numbers
        (service as any).checkForEdges(startingCoord);
        for (const pixelIndex of expectedBlackedPixels) {
            expect(service['contourImageData'].data[pixelIndex + R_POSITION]).toEqual(0);
            expect(service['contourImageData'].data[pixelIndex + G_POSITION]).toEqual(0);
            expect(service['contourImageData'].data[pixelIndex + B_POSITION]).toEqual(0);
            expect(service['contourImageData'].data[pixelIndex + A_POSITION]).toEqual(MAX_RGBA_VALUE);
        }
    });
});
