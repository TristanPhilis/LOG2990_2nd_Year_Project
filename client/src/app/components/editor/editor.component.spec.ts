import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AttributePanelComponent } from '@app/components/attribute-panel/attribute-panel.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { MockComponents } from 'ng-mocks';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MatDialogModule, BrowserModule, BrowserAnimationsModule, MatSidenavModule],
                declarations: [EditorComponent, MockComponents(SidebarComponent, AttributePanelComponent, DrawingComponent)],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
