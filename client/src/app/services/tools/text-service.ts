import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { TextIndex } from '@app/classes/text-index';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { BLINKER_INTERVAL_TIME, FONTS, FONT_ALIGNMENTS, FONT_WEIGHTS, KEYS, TEXT_DEFAULT_OPTIONS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    private pathData: Vec2[];
    private currentText: string[];
    private textIndex: TextIndex;
    private blinkerPosition: Vec2;
    private blinkerOn: boolean;
    private blinkerHandler: ReturnType<typeof setTimeout>;
    private fonts: string[];
    private fontWeights: string[];
    private textAlignments: string[];
    writingMode: boolean;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
        this.clearPath();
        this.setDefaultOptions();
        this.clearText();
        this.writingMode = false;
        this.blinkerOn = false;

        this.fonts = FONTS;
        this.fontWeights = FONT_WEIGHTS;
        this.textAlignments = FONT_ALIGNMENTS;
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.fontSize, { value: TEXT_DEFAULT_OPTIONS.size, displayName: 'Taille' }],
            [Options.font, { value: TEXT_DEFAULT_OPTIONS.font, displayName: 'Police' }],
            [Options.fontWeight, { value: TEXT_DEFAULT_OPTIONS.weight, displayName: 'Typographie' }],
            [Options.textAlignment, { value: TEXT_DEFAULT_OPTIONS.alignment, displayName: 'Alignement' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.writingMode) {
            const mouseUpCoord = this.getPositionFromMouse(event);
            this.pathData.push(mouseUpCoord);
            this.blinkerPosition = mouseUpCoord;
            this.writingMode = true;
            this.startBlinker();
            this.onActionStart();
        } else if (this.writingMode) {
            this.completeAction();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.writingMode) {
            return;
        }
        const ctx = this.drawingService.previewCtx;
        switch (event.key) {
            case KEYS.BACKSPACE: {
                if (!this.currentText[this.textIndex.lineIndex]) {
                    this.adjustForBackJumpLine();
                    this.adjustForBackSpaceJump();
                } else {
                    this.textIndex.letterIndex -= 1;
                    this.deleteLetter();
                }
                break;
            }
            case KEYS.DELETE: {
                this.deleteLetter();
                break;
            }
            case KEYS.ENTER: {
                this.adjustForJumpLine(ctx);
                break;
            }
            case KEYS.ESCAPE: {
                this.cleanAll();
                this.drawingService.clearCanvas(ctx);
                this.onActionFinish();
                return;
            }
            case KEYS.ARROW_LEFT: {
                if (this.textIndex.letterIndex > 0) {
                    this.textIndex.letterIndex -= 1;
                } else {
                    this.adjustForBackJumpLine();
                }
                break;
            }
            case KEYS.ARROW_RIGHT: {
                if (this.textIndex.letterIndex <= this.currentText[this.textIndex.lineIndex].length) {
                    this.textIndex.letterIndex += 1;
                } else {
                    this.textIndex.letterIndex = 0;
                    this.textIndex.lineIndex += 1;
                }
                break;
            }
            case KEYS.TAB: {
                this.writeLetter(' ');
                this.writeLetter(' ');
                this.writeLetter(' ');
                this.writeLetter(' ');
                break;
            }
            default: {
                if (event.key.length > 1) {
                    return;
                }
                this.writeLetter(event.key);
                break;
            }
        }
        event.preventDefault();

        this.draw(ctx, this.getDrawingAction());
    }

    // Definitive writing and preview writing //
    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (drawingAction.path) {
            ctx.textAlign = this.getAlignmentString(drawingAction);
            ctx.font = this.getFontOptionsString(drawingAction);
            ctx.fillStyle = drawingAction.options.primaryColor.getRgbString();
            ctx.textBaseline = 'ideographic';
            this.printText(ctx, drawingAction);
            this.drawingService.autoSave();
        }
    }

    private printText(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const text = drawingAction.text;
        const path = drawingAction.path;

        if (!text || !path) {
            return;
        }

        text.forEach((line, index) => {
            if (!path[index]) {
                return;
            }
            ctx.fillText(line, path[index].x, path[index].y);
        });
    }

    private completeAction(): void {
        const drawingAction = this.getDrawingAction();
        this.action.next(drawingAction);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        this.cleanAll();
        this.onActionFinish();
    }
    // End of section //

    // Methods to confirm text or refresh the preview, used by other components //
    onToolChange(): void {
        if (this.writingMode) {
            this.completeAction();
        }
    }

    onOptionValueChange(): void {
        if (!this.writingMode) {
            return;
        }
        const drawingAction = this.getDrawingAction();
        this.draw(this.drawingService.previewCtx, drawingAction);
    }
    // End of section //

    // Methods to set up the writing style //
    private getFontOptionsString(drawingAction: DrawingAction): string {
        let index = (drawingAction.options.toolOptions.get(Options.fontWeight) as ToolOption).value;
        let font = '';

        font = this.fontWeights[index];
        font += ' ';

        font += String((drawingAction.options.toolOptions.get(Options.fontSize) as ToolOption).value);
        font += 'px ';

        index = (drawingAction.options.toolOptions.get(Options.font) as ToolOption).value;

        font += this.fonts[index];

        return font;
    }

    private getAlignmentString(drawingAction: DrawingAction): CanvasTextAlign {
        const index = (drawingAction.options.toolOptions.get(Options.textAlignment) as ToolOption).value;
        return this.textAlignments[index] as CanvasTextAlign;
    }
    // End of section //

    // Methods to deal with changing line //
    private adjustForJumpLine(ctx: CanvasRenderingContext2D): void {
        const textProperties = ctx.measureText(this.currentText[this.textIndex.lineIndex]);
        const startCoordinates: Vec2 = { x: this.pathData[this.textIndex.lineIndex].x, y: this.pathData[this.textIndex.lineIndex].y };
        startCoordinates.y += textProperties.actualBoundingBoxAscent;

        this.pathData.push(startCoordinates);
        this.textIndex.lineIndex += 1;
        this.textIndex.letterIndex = 0;
        this.currentText[this.textIndex.lineIndex] = '';
    }

    private adjustForBackJumpLine(): void {
        if (this.textIndex.lineIndex > 0) {
            this.textIndex.lineIndex -= 1;
        }

        this.textIndex.letterIndex = this.currentText[this.textIndex.lineIndex] ? this.currentText[this.textIndex.lineIndex].length : 0;
    }

    private adjustForBackSpaceJump(): void {
        if (this.textIndex.lineIndex === 0 && this.textIndex.letterIndex === 0) {
            this.currentText[this.textIndex.lineIndex] = '';
        } else {
            this.pathData.pop();
            this.currentText.pop();
        }
    }
    // End of section //

    // Methods to display the blinker correctly //
    private calculateBlinkerPosition(ctx: CanvasRenderingContext2D): void {
        const isAtEndOfLine = this.textIndex.letterIndex === this.currentText[this.textIndex.lineIndex].length;

        const text = isAtEndOfLine
            ? this.currentText[this.textIndex.lineIndex]
            : this.currentText[this.textIndex.lineIndex].slice(0, this.textIndex.letterIndex);

        const shiftDistance = ctx.measureText(text).width;
        if (this.pathData[this.textIndex.lineIndex]) {
            this.blinkerPosition = { x: this.pathData[this.textIndex.lineIndex].x, y: this.pathData[this.textIndex.lineIndex].y };
            this.blinkerPosition.x += shiftDistance;
        }
    }

    private drawBlinker(): void {
        const ctx = this.drawingService.previewCtx;
        const drawingAction = this.getDrawingAction();
        const blinkerHeight = (drawingAction.options.toolOptions.get(Options.fontSize) as ToolOption).value;
        this.calculateBlinkerPosition(ctx);

        ctx.beginPath();
        ctx.moveTo(this.blinkerPosition.x, this.blinkerPosition.y - blinkerHeight);
        ctx.lineTo(this.blinkerPosition.x, this.blinkerPosition.y);

        this.blinkerOn = !this.blinkerOn;
        ctx.strokeStyle = this.blinkerOn ? 'black' : 'rgba(255, 255, 255, 1)';
        ctx.stroke();
    }

    private startBlinker(): void {
        this.blinkerHandler = setInterval(() => {
            this.drawBlinker();
        }, BLINKER_INTERVAL_TIME);
    }
    // End of section //

    // Methods to either write or delete a letter //
    private writeLetter(letter: string): void {
        let textInFront = this.currentText[this.textIndex.lineIndex].substring(0, this.textIndex.letterIndex);
        const textBehind = this.currentText[this.textIndex.lineIndex].substring(
            this.textIndex.letterIndex,
            this.currentText[this.textIndex.lineIndex].length,
        );

        textInFront += letter;

        this.currentText[this.textIndex.lineIndex] = textInFront.concat(textBehind);
        this.textIndex.letterIndex += 1;
    }

    private deleteLetter(): void {
        const textInFront = this.currentText[this.textIndex.lineIndex].substring(0, this.textIndex.letterIndex);
        const textBehind = this.currentText[this.textIndex.lineIndex].substring(
            this.textIndex.letterIndex + 1,
            this.currentText[this.textIndex.lineIndex].length,
        );
        this.currentText[this.textIndex.lineIndex] = textInFront.concat(textBehind);
    }
    // End of section //

    private getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.textService,
            text: this.currentText,
            path: this.pathData,
            options,
        };
    }
    private cleanAll(): void {
        this.clearText();
        this.clearPath();
        this.writingMode = false;
        clearInterval(this.blinkerHandler);
    }
    private clearPath(): void {
        this.pathData = [];
    }
    private clearText(): void {
        this.currentText = [''];
        this.textIndex = { letterIndex: 0, lineIndex: 0 };
        this.blinkerPosition = { x: 0, y: 0 };
    }
}
