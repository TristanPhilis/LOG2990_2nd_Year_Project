import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GuideComponent } from './guide.component';

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
});
