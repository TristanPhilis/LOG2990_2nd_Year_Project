import { DrawingInfo } from '@common/communication/drawing-info';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class IndexService {
    clientDrawings: DrawingInfo[];
    constructor() {
        this.clientDrawings = [];
    }

    storeDrawing(drawing: DrawingInfo): void {
        this.clientDrawings.push(drawing);
    }

    getAllDrawings(): DrawingInfo[] {
        return this.clientDrawings;
    }

    deleteDrawing(drawingId: number): DrawingInfo {
        let deletedDrawing: DrawingInfo;
        deletedDrawing = { id: -1, name: 'drawingNotFound', tags: [''], metadata: '' };
        for (const clientDrawing of this.clientDrawings) {
            if (clientDrawing.id === drawingId) {
                const index = this.clientDrawings.indexOf(clientDrawing);
                this.clientDrawings.splice(index, 1);
                deletedDrawing = clientDrawing;
            }
        }
        return deletedDrawing;
    }
}
