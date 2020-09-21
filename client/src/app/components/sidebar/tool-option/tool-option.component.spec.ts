import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolOptionComponent } from './tool-option.component';

describe('ToolOptionComponent', () => {
    // let component: ToolOptionComponent;
    let fixture: ComponentFixture<ToolOptionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolOptionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolOptionComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });
});
