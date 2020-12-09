import { DrawingToolId } from '@app/shared/enum';
import { Box } from './box';
import { DrawingOptions } from './drawing-options';
import { Vec2 } from './vec2';

export interface DrawingAction {
    path?: Vec2[];
    box?: Box;
    text?: string[];
    imageData?: ImageData;
    mousePosition?: Vec2;
    id: DrawingToolId;
    options: DrawingOptions;
}
