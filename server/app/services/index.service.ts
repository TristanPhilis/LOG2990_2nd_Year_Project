import { DrawingInfo } from '@common/communication/drawing-info';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class IndexService {
    clientDrawings: DrawingInfo[];
    constructor() {
        this.clientDrawings = [];
    }

    async storeDrawing(drawingInfo: DrawingInfo): Promise<void> {
        this.clientDrawings.push(drawingInfo);
    }

    async getAllDrawings(): Promise<DrawingInfo[]> {
        return this.clientDrawings;
    }

    async deleteDrawing(drawingId: number): Promise<void> {
        for (const clientDrawing of this.clientDrawings) {
            const index = this.clientDrawings.indexOf(clientDrawing);;
            this.clientDrawings.splice(index, 1);
        }
    }
}
