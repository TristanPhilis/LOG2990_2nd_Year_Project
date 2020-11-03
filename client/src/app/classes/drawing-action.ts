import { drawingToolId } from '@app/shared/enum';
import { Box } from './box';
import { DrawingOptions } from './drawing-options';
import { Vec2 } from './vec2';

export interface DrawingAction {
    path?: Vec2[];
    box?: Box;
    imageData?: ImageData;
    id: drawingToolId;
    options: DrawingOptions;

    thickness?: number;
    traceType?: number;
}
