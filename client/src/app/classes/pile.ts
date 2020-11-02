import { drawingToolId } from '@app/shared/enum';
import { Vec2 } from './vec2';

export interface UndoRedoPile {
    path: Vec2[];
    id: drawingToolId;
    thickness?: number;
    traceType?: number;
}
