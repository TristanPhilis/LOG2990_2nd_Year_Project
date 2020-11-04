// tslint:disable-next-line: no-relative-imports
import { drawingToolId, Texture, TraceTypes } from '../shared/enum';

export interface ToolOption {
    id: drawingToolId | TraceTypes | Texture;
    name: string;
}
