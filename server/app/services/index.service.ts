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
}
