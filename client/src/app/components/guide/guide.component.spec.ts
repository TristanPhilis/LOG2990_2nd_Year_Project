import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GuideComponent } from './guide.component';

describe('GuideComponent', () => {
    let component: GuideComponent;
    let fixture: ComponentFixture<GuideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GuideComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change tabContent and tabLink', () => {
        const tab = 'crayon';
        component.openTab(tab);
        expect(component.tabcontent).toBeDefined();
        expect(component.tablinks).toBeDefined();
    });
});
