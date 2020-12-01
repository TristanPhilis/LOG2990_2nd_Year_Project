import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WebRequestService } from '@app/services/index/web-request-service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const CURRENT_DRAWINGS_MAX_SIZE = 3;

@Injectable({
    providedIn: 'root',
})
export class CarouselService {
    drawingsInfo: BehaviorSubject<DrawingInfo[]>;
    currentDrawings: DrawingInfo[];
    filteredDrawings: DrawingInfo[];
    drawingCounter: number;
    tagInput: FormControl;
    tags: string[];

    constructor(private basicService: WebRequestService) {
        this.drawingCounter = 0;
        this.drawingsInfo = new BehaviorSubject<DrawingInfo[]>([]);
        this.filteredDrawings = [];
        this.currentDrawings = [];
        this.getAllDrawings();
        this.tagInput = new FormControl('');
        this.tags = new Array();
    }

    addTag(): void {
        if (!this.tags.includes(this.tagInput.value)) {
            this.tags.push(this.tagInput.value);
        }
        this.tagInput.reset();
        this.filteredDrawings = [];
        this.filterDrawings();
    }

    deleteTag(name: string): void {
        this.tags.splice(this.tags.indexOf(name), 1);
        this.filteredDrawings = [];
        this.filterDrawings();
    }

    updateFromCurrentArray(currentArray: DrawingInfo[]): void {
        switch (currentArray.length) {
            case 0:
                this.currentDrawings = [];
                break;
            case 1:
                this.currentDrawings = [currentArray[0]];
                break;
            case 2:
                this.currentDrawings = [
                    currentArray[this.getDrawingPosition(this.drawingCounter - 1, currentArray)],
                    currentArray[this.getDrawingPosition(this.drawingCounter, currentArray)],
                ];
                break;
            default:
                for (let i = 0; i < CURRENT_DRAWINGS_MAX_SIZE; i++) {
                    this.currentDrawings[i] = currentArray[this.getDrawingPosition(this.drawingCounter - 1 + i, currentArray)];
                }
                break;
        }
    }

    updateCurrentDrawings(): void {
        if (this.tags?.length === 0) {
            this.updateFromCurrentArray(this.drawingsInfo?.value);
        } else {
            this.updateFromCurrentArray(this.filteredDrawings);
        }
    }

    getAllDrawings(): void {
        const subs = this.basicService
            .getAllDrawings()
            .pipe(
                map((drawingInfo: DrawingInfo[]) => {
                    return drawingInfo;
                }),
            )
            .subscribe(
                (drawingsInfo) => {
                    this.drawingsInfo.next(drawingsInfo);
                },
                (error: Error) => {
                    throw error;
                },
                () => {
                    this.updateCurrentDrawings();
                },
            );
        subs.unsubscribe();
    }

    deleteDrawing(drawingId: number): void {
        const subs = this.basicService.deleteDrawing(drawingId)?.subscribe(
            (deletedDrawingId: number) => {
                for (const drawingInfo of this.drawingsInfo.value) {
                    if (drawingInfo.id === deletedDrawingId) {
                        const index = this.drawingsInfo.value.indexOf(drawingInfo);
                        this.drawingsInfo.value.splice(index, 1);
                    }
                }
            },
            () => {
                throw new Error('Error: Drawing does not exist');
            },
            () => {
                this.updateCurrentDrawings();
            },
        );
        subs?.unsubscribe();
    }

    getDrawingPosition(counter: number, currentArray: DrawingInfo[]): number {
        let position = counter % currentArray.length;
        if (position < 0) {
            position += currentArray.length;
        }
        return position;
    }

    goToPreviousDrawing(): void {
        this.drawingCounter--;
        if (this.drawingCounter < 0) {
            this.drawingCounter = this.drawingsInfo.value.length - 1;
        }
        this.updateCurrentDrawings();
    }

    goToNextDrawing(): void {
        if (this.drawingCounter === this.drawingsInfo.value.length - 1) {
            this.drawingCounter = 0;
        } else {
            this.drawingCounter++;
        }
        this.updateCurrentDrawings();
    }

    filterDrawings(): void {
        if (this.tags.length !== 0)
            for (const drawing of this.drawingsInfo.value) {
                for (const tag of drawing.tags) {
                    for (const searchedTag of this.tags) {
                        if (tag === searchedTag && !this.filteredDrawings.includes(drawing)) this.filteredDrawings.push(drawing);
                    }
                }
            }
        else this.filteredDrawings = this.drawingsInfo.value;
        this.updateCurrentDrawings();
    }
}
