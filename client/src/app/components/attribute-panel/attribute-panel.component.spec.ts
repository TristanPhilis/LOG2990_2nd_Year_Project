import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarColorOptionsComponent } from '@app/components/sidebar/color-picker/sidebar-color-options/sidebar-color-options.component';
import { MockComponent } from 'ng-mocks';
import { AttributePanelComponent } from './attribute-panel.component';

describe('AttributePanelComponent', () => {
    let component: AttributePanelComponent;
    let fixture: ComponentFixture<AttributePanelComponent>;

    // let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
    // let pencilServiceSpy: jasmine.SpyObj<PencilService>;
    // let rectangleService: jasmine.SpyObj<ToolsService>;
    // let ellipseService: jasmine.SpyObj<ToolsService>;
    // let lineService: jasmine.SpyObj<ToolsService>;
    // let eraserService: jasmine.SpyObj<ToolsService>;
    // let brushService: jasmine.SpyObj<ToolsService>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributePanelComponent, MockComponent(SidebarColorOptionsComponent)],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should change the current drawing tool', () => {});
});
