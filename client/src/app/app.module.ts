import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributePanelComponent } from './components/attribute-panel/attribute-panel.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
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
        ToolOptionComponent,
        SidebarToolComponent,
        AttributePanelComponent,
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, BrowserAnimationsModule],
    exports: [],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
