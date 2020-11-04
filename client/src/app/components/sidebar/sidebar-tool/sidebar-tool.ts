import { drawingToolId, sidebarToolID } from '@app/shared/enum';
export interface SidebarTool {
    id: sidebarToolID;
    name: string;
    defaultDrawingToolid?: drawingToolId;
}
