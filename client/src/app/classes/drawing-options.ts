import { Texture, TraceTypes } from '@app/shared/enum';
import { Color } from './color';

export interface DrawingOptions {
    primaryColor: Color;
    secondaryColor?: Color;

    size?: number;
    outlineType?: string;
    traceType?: TraceTypes;
    texture?: Texture;
    toleranceInterval?: number;
    numberOfSides?: number;
    angle?: number;
    lineLength?: number;
    emissionPerSecond?: number;
    imageChoice?: string;
}
