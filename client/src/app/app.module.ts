import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { CreateNewDrawingComponent } from './components/create-new-drawing/create-new-drawing.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GuideComponent } from './components/guide/guide.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SavePopupComponent } from './components/popup/save-popup/save-popup.component';
import { ColorPaletteComponent } from './components/sidebar/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/sidebar/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/sidebar/color-picker/color-slider/color-slider.component';
import { SidebarColorOptionsComponent } from './components/sidebar/color-picker/sidebar-color-options/sidebar-color-options.component';
import { SidebarToolComponent } from './components/sidebar/sidebar-tool/sidebar-tool.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolOptionComponent } from './components/sidebar/tool-option/tool-option.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        ToolOptionComponent,
        SidebarToolComponent,
        SidebarColorOptionsComponent,
        AttributePanelComponent,
        CreateNewDrawingComponent,
        SavePopupComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatIconModule,
    ],
    entryComponents: [GuideComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
