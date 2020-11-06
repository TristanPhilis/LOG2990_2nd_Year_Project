import { Options } from '@app/shared/enum';
import { Color } from './color';
import { ToolOption } from './tool-option';

export interface DrawingOptions {
    primaryColor: Color;
    secondaryColor?: Color;
    toolOptions: Map<Options, ToolOption>;
}
