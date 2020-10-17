import { DrawingInfo } from '@common/communication/drawing-info';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class IndexService {
    clientDrawings: DrawingInfo[];
    constructor() {
        this.clientDrawings = [];
    }

    storeDrawing(drawingInfo: DrawingInfo): void {
        this.clientDrawings.push(drawingInfo);
    }

    getAllDrawings(): DrawingInfo[] {
        return this.clientDrawings;
    }

    deleteDrawing(drawingId: number): void {
        for (const clientDrawing of this.clientDrawings) {
            if (clientDrawing.id === drawingId) {
                const index = this.clientDrawings.indexOf(clientDrawing);
                this.clientDrawings.splice(index, 1);
            }
        }
    }
}
