import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SidebarColorOptionsComponent } from '@app/components/sidebar/color-picker/sidebar-color-options/sidebar-color-options.component';
import { drawingToolId, Options, Texture } from '@app/shared/enum';
import { MockComponent } from 'ng-mocks';
import { AttributePanelComponent } from './attribute-panel.component';

// tslint:disable:no-any
describe('AttributePanelComponent', () => {
    let component: AttributePanelComponent;
    let fixture: ComponentFixture<AttributePanelComponent>;
    // let toolsService: ToolsService;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AttributePanelComponent, MockComponent(SidebarColorOptionsComponent)],
            }).compileComponents();
            // toolsService = TestBed.inject(ToolsService);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change to the correct drawing tool', () => {
        const tool = drawingToolId.brushService;
        component.handleToolChange(drawingToolId.brushService);
        expect(component.toolsService._currentDrawingToolID).toEqual(tool);
    });

    it('should update ToolOption to the correct value', () => {
        component.updateToolOptionValue(Options.texture, Texture.one);
        // expect(toolsService.currentDrawingToolOptions?.get(Options.texture)?.value).toEqual(Texture.one); // Not finished
    });
});
