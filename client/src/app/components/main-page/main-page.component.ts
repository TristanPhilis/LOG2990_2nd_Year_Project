import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { GuideComponent } from '@app/components/guide/guide.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    constructor(public dialog: MatDialog) {}

    openGuide(): void {
        this.dialog.open(GuideComponent);
    }

    openCarousel(): void {
        this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });
    }
}
