import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GuideComponent } from './guide.component';
// tslint:disable:no-any
describe('GuideComponent', () => {
    let component: GuideComponent;
    let fixture: ComponentFixture<GuideComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [GuideComponent],
            }).compileComponents();
            fixture = TestBed.createComponent(GuideComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(GuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openTab should set tabElement and tabContent', () => {
        const tempString = 'temp';
        component.openTab(tempString);
        expect((component as any).tabElement).toEqual(document.getElementById(tempString));
        expect((component as any).tabContent).toEqual(document.getElementsByClassName('tabcontent'));
    });
});
