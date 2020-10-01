import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GuideComponent } from './components/guide/guide.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolOptionComponent } from './components/sidebar/tool-option/tool-option.component';

@NgModule({
    declarations: [AppComponent, EditorComponent, SidebarComponent, DrawingComponent, MainPageComponent, ToolOptionComponent],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, MatDialogModule, MatButtonModule, BrowserModule, BrowserAnimationsModule],
    entryComponents: [GuideComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
