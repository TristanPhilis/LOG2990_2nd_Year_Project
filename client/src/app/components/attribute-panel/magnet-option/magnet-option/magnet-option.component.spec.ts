import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MagnetOptionComponent } from './magnet-option.component';

describe('MagnetOptionComponent', () => {
    let component: MagnetOptionComponent;
    let fixture: ComponentFixture<MagnetOptionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MagnetOptionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetOptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
