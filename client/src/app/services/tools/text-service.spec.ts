import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingAction } from '@app/classes/drawing-action';
import { TextIndex } from '@app/classes/text-index';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { KEYS } from '@app/shared/constant';
import { Options } from '@app/shared/enum';
import { TextService } from './text-service';

// tslint:disable: no-any
// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: max-file-line-count
describe('TextService', () => {
    let service: TextService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let dummyMouseEvent: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSpy: jasmine.Spy<any>;

    let dummyCurrentText: string[];
    let dummyDrawingAction: DrawingAction;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'fillText', 'beginPath', 'autoSave']);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(TextService);
        drawSpy = spyOn<any>(service, 'draw').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        dummyMouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        dummyCurrentText = ['Test', '', ''];

        dummyDrawingAction = (service as any).getDrawingAction();

        service['currentText'] = dummyCurrentText;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true when Left MouseButton is pressed', () => {
        service.onMouseDown(dummyMouseEvent);
        expect(service.mouseDown).toBeTrue();
    });

    it('should push coordinates into pathData', () => {
        service['writingMode'] = false;
        service.mouseDown = true;
        const pushSpy = spyOn<any>(service['pathData'], 'push');
        service.onMouseUp(dummyMouseEvent);
        expect(pushSpy).toHaveBeenCalled();
        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should call completeAction when writingMode is true', () => {
        service['writingMode'] = true;
        service.mouseDown = false;
        service.onMouseUp(dummyMouseEvent);

        expect(drawSpy).toHaveBeenCalled();
    });

    it('should not call anything if the wrong mouseButton is pushed', () => {
        const startBlinkerSpy = spyOn<any>(service, 'startBlinker').and.callThrough();
        const completeActionSpy = spyOn<any>(service, 'completeAction').and.callThrough();

        service['writingMode'] = false;
        service.mouseDown = false;
        service.onMouseUp(dummyMouseEvent);

        expect(startBlinkerSpy).not.toHaveBeenCalled();
        expect(completeActionSpy).not.toHaveBeenCalled();
    });

    it('should return if writingMode is false', () => {
        service['writingMode'] = false;
        const dummyKeyEvent = {
            code: 'KeyA',
            key: 'a',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;

        service.onKeyDown(dummyKeyEvent);

        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should call draw', () => {
        const dummyKeyEvent = {
            code: 'KeyA',
            key: 'a',
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should return if the default case is hit and the keys length is > 1', () => {
        service['writingMode'] = false;
        const dummyKeyEvent = {
            key: KEYS.SHIFT,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should call the 2 adjust methods when Backspace does jump line back', () => {
        const adjustBackJumpSpy = spyOn<any>(service, 'adjustForBackJumpLine').and.callThrough();
        const adjustBackSpaceSpy = spyOn<any>(service, 'adjustForBackSpaceJump').and.callThrough();

        const dummyKeyEvent = {
            key: KEYS.BACKSPACE,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 1 } as TextIndex;
        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(adjustBackJumpSpy).toHaveBeenCalled();
        expect(adjustBackSpaceSpy).toHaveBeenCalled();
    });

    it('should call deleteLetter on Backspace and there is text', () => {
        const deleteLetterSpy = spyOn<any>(service, 'deleteLetter').and.callThrough();

        const dummyKeyEvent = {
            key: KEYS.BACKSPACE,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 0 } as TextIndex;
        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(deleteLetterSpy).toHaveBeenCalled();
    });

    it('should call deleteLetter on Delete key', () => {
        const deleteLetterSpy = spyOn<any>(service, 'deleteLetter').and.callThrough();

        const dummyKeyEvent = {
            key: KEYS.DELETE,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 0 } as TextIndex;
        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(deleteLetterSpy).toHaveBeenCalled();
    });

    it('should call adjust method on Enter key', () => {
        const adjustJumpSpy = spyOn<any>(service, 'adjustForJumpLine').and.callThrough();

        const dummyKeyEvent = {
            key: KEYS.ENTER,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 1 } as TextIndex;
        const dummyPathData = [
            { x: 25, y: 25 },
            { x: 25, y: 50 },
        ];
        service['textIndex'] = dummytextIndex;
        service['pathData'] = dummyPathData;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(adjustJumpSpy).toHaveBeenCalled();
    });

    it('should call cleanAll on Escape key', () => {
        const cleanAllSpy = spyOn<any>(service, 'cleanAll').and.callThrough();

        const dummyKeyEvent = { key: KEYS.ESCAPE } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 1 } as TextIndex;
        const dummyPathData = [
            { x: 25, y: 25 },
            { x: 25, y: 50 },
        ];
        service['textIndex'] = dummytextIndex;
        service['pathData'] = dummyPathData;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(cleanAllSpy).toHaveBeenCalled();
    });

    it('should decrement the letter index if the letterIndex is > 0 on ArrowLeft key', () => {
        const dummyKeyEvent = {
            key: KEYS.ARROW_LEFT,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 3, lineIndex: 1 } as TextIndex;

        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(service['textIndex'].letterIndex).toEqual(2);
    });

    it('should call adjust method to jumpline back when letterIndex is = 0 on ArrowLeft key  ', () => {
        const adjustBackJumpSpy = spyOn<any>(service, 'adjustForBackJumpLine').and.callThrough();

        const dummyKeyEvent = {
            key: KEYS.ARROW_LEFT,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 0, lineIndex: 1 } as TextIndex;

        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(adjustBackJumpSpy).toHaveBeenCalled();
    });

    it('should increment the letterIndex if the letterIndex is < to the current texts length on ArrowRight key', () => {
        const dummyKeyEvent = {
            key: KEYS.ARROW_RIGHT,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 2, lineIndex: 0 } as TextIndex;

        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(service['textIndex'].letterIndex).toEqual(3);
    });

    it('should increment the lineIndex and reset the letterIndex if else on ArrowRight key', () => {
        const dummyKeyEvent = {
            key: KEYS.ARROW_RIGHT,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        const dummytextIndex = { letterIndex: 5, lineIndex: 0 } as TextIndex;

        service['textIndex'] = dummytextIndex;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        expect(service['textIndex'].letterIndex).toEqual(0);
        expect(service['textIndex'].lineIndex).toEqual(1);
    });

    it('should call writeLetter 4 times when Tab is hit', () => {
        const writeLetterSpy = spyOn<any>(service, 'writeLetter').and.callThrough();
        const dummyKeyEvent = {
            key: KEYS.TAB,
            preventDefault: () => {
                return;
            },
        } as KeyboardEvent;
        service['writingMode'] = true;

        service.onKeyDown(dummyKeyEvent);

        const expectedNumberOfCalls = 4;
        expect(writeLetterSpy).toHaveBeenCalledTimes(expectedNumberOfCalls);
    });

    it('should not call anything if drawingAction.path is empty', () => {
        const printTextSpy = spyOn<any>(service, 'printText').and.callThrough();
        dummyDrawingAction = {} as DrawingAction;

        service.draw(previewCtxStub, dummyDrawingAction);

        expect(printTextSpy).not.toHaveBeenCalled();
    });

    it('should not call fillText if drawingAction has no text', () => {
        const fillTextSpy = spyOn<any>(previewCtxStub, 'fillText').and.callThrough();

        dummyDrawingAction.text = undefined;

        (service as any).printText(previewCtxStub, dummyDrawingAction);

        expect(fillTextSpy).not.toHaveBeenCalled();
    });

    it('should call completeAction when clicking on other tool for example', () => {
        const completeActionSpy = spyOn<any>(service, 'completeAction').and.callThrough();

        service['writingMode'] = true;
        service.confirmTextFromOther();

        expect(completeActionSpy).toHaveBeenCalled();
    });

    it('should not call completeAction if writingMode is false', () => {
        const completeActionSpy = spyOn<any>(service, 'completeAction').and.callThrough();

        service['writingMode'] = false;
        service.confirmTextFromOther();

        expect(completeActionSpy).not.toHaveBeenCalled();
    });

    it('should return if writingMode is false', () => {
        service['writingMode'] = false;

        service.onOptionValueChange();

        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('should call draw if writingMode is true', () => {
        service['writingMode'] = true;

        service.onOptionValueChange();

        expect(drawSpy).toHaveBeenCalled();
    });

    it('should not add a font weight if drawingAction is faulty', () => {
        const faultyToolOption = { value: 5, displayName: 'Faulty' };
        dummyDrawingAction.options.toolOptions.set(Options.fontWeight, faultyToolOption);

        const fontOption = (service as any).getFontOptionsString(dummyDrawingAction) as string;
        const test = fontOption.includes('normal');

        expect(test).toBeFalse();
    });

    it('should not add a font name if drawingAction is faulty', () => {
        const faultyToolOption = { value: 6, displayName: 'Faulty' };
        dummyDrawingAction.options.toolOptions.set(Options.font, faultyToolOption);

        const fontOption = (service as any).getFontOptionsString(dummyDrawingAction) as string;

        const test = fontOption.includes('arial');
        expect(test).toBeFalse();
    });

    it('should reset letterIndex when jumping line back if there is no text in the line before', () => {
        const dummytextIndex = { letterIndex: 0, lineIndex: 2 } as TextIndex;
        service['textIndex'] = dummytextIndex;

        (service as any).adjustForBackJumpLine();

        expect(service['textIndex'].letterIndex).toEqual(0);
    });

    it('should not decrement lineIndex if lineIndex = 0', () => {
        const dummytextIndex = { letterIndex: 0, lineIndex: 0 } as TextIndex;
        service['textIndex'] = dummytextIndex;

        (service as any).adjustForBackJumpLine();

        expect(service['textIndex'].lineIndex).toEqual(0);
    });

    it('should set the currentText with an empty string when Backspacing on an empty line', () => {
        const dummytextIndex = { letterIndex: 0, lineIndex: 0 } as TextIndex;
        dummyCurrentText = [''];
        service['textIndex'] = dummytextIndex;

        (service as any).adjustForBackSpaceJump();

        expect(service['currentText'][service['textIndex'].lineIndex]).toEqual('');
    });

    it('should contain the string from the whole line if letterIndex is of lenght of the currentText', () => {
        const dummytextIndex = { letterIndex: 4, lineIndex: 0 } as TextIndex;
        service['textIndex'] = dummytextIndex;

        (service as any).calculateBlinkerPosition(previewCtxStub);

        expect(service['currentText'][dummytextIndex.lineIndex]).toEqual('Test');
    });

    it('should call measureText on the canvas', () => {
        const measureTextSpy = spyOn<any>(previewCtxStub, 'measureText').and.callThrough();
        (service as any).calculateBlinkerPosition(previewCtxStub);

        expect(measureTextSpy).toHaveBeenCalled();
    });

    it('should add the text width to the blinkerposition', () => {
        const dummytextIndex = { letterIndex: 4, lineIndex: 0 } as TextIndex;
        const textWidth = previewCtxStub.measureText('Test').width;
        const dummyPathData = [
            { x: 25, y: 25 },
            { x: 25, y: 50 },
        ];
        service['textIndex'] = dummytextIndex;
        service['pathData'] = dummyPathData;

        const blinkerPositionX = service['pathData'][dummytextIndex.lineIndex].x + textWidth;

        (service as any).calculateBlinkerPosition(previewCtxStub);

        expect(service['blinkerPosition'].x).toEqual(blinkerPositionX);
    });

    it('should call calculateBlinker position when drawing blinker', () => {
        const calculateBlinkerSpy = spyOn<any>(service, 'calculateBlinkerPosition').and.callThrough();

        (service as any).drawBlinker();

        expect(calculateBlinkerSpy).toHaveBeenCalled();
    });

    it('should be black strokStyule if blinkerOn is true', () => {
        service['blinkerOn'] = true;

        (service as any).drawBlinker();

        expect(previewCtxStub.strokeStyle).toEqual('#ffffff');
    });

    describe('test with timer', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should call drawBlinker 2 times in 1000ms', () => {
            const drawBlinkerSpy = spyOn<any>(service, 'drawBlinker');
            const tickTime = 1000;

            (service as any).startBlinker();
            jasmine.clock().tick(tickTime);

            const expectedNumberOfCalls = 2;
            expect(drawBlinkerSpy).toHaveBeenCalledTimes(expectedNumberOfCalls);
        });
    });
});
