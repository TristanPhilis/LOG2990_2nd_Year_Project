import { DrawingToolId, SidebarToolID } from '@app/shared/enum';
export interface SidebarTool {
    id: SidebarToolID;
    name: string;
    defaultDrawingToolid?: DrawingToolId;
}
