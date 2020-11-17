import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { GridOptionsComponent } from './components/attribute-panel/grid-options/grid-options/grid-options.component';
import { MagnetOptionComponent } from './components/attribute-panel/magnet-option/magnet-option/magnet-option.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { CreateNewDrawingComponent } from './components/create-new-drawing/create-new-drawing.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GuideComponent } from './components/guide/guide.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { PipettePreviewComponent } from './components/pipette-preview/pipette-preview.component';
import { ExportPopupComponent } from './components/popup/export-popup/export-popup.component';
import { SavePopupComponent } from './components/popup/save-popup/save-popup.component';
import { ColorPaletteComponent } from './components/sidebar/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/sidebar/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/sidebar/color-picker/color-slider/color-slider.component';
import { SidebarColorOptionsComponent } from './components/sidebar/color-picker/sidebar-color-options/sidebar-color-options.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

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
        SidebarColorOptionsComponent,
        AttributePanelComponent,
        CarouselComponent,
        CreateNewDrawingComponent,
        SavePopupComponent,
        ExportPopupComponent,
        PipettePreviewComponent,
        GridOptionsComponent,
        MagnetOptionComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        MatRadioModule,
        MatSliderModule,
    ],
    entryComponents: [GuideComponent, CarouselComponent, ColorPickerComponent, ExportPopupComponent, SavePopupComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
