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
        const dialogRef = this.dialog.open(GuideComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
    }

    openCarousel(): void {
        const dialogRef = this.dialog.open(CarouselComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
    }
}
