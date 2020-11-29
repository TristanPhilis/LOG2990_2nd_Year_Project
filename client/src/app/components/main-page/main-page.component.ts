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

        const subs = dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
        subs.unsubscribe();
    }

    openCarousel(): void {
        const dialogRef = this.dialog.open(CarouselComponent, { width: '90%', height: '70%' });

        const subs = dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
        subs.unsubscribe();
    }
}
