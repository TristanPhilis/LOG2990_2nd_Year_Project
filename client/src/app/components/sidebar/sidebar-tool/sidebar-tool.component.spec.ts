import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarToolComponent } from './sidebar-tool.component';

describe('SidebarToolComponent', () => {
    let component: SidebarToolComponent;
    let fixture: ComponentFixture<SidebarToolComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SidebarToolComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarToolComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
