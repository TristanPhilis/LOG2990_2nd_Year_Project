import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { DatabaseService } from '@app/services/database/database.service';
import { IndexService } from '@app/services/index/index.service';
import { DrawingInfo } from '@common/communication/drawing-info';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
// tslint:disable-next-line: no-relative-imports
import { GuideComponent } from '../guide/guide.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    drawingsInfo: BehaviorSubject<DrawingInfo[]> = new BehaviorSubject<DrawingInfo[]>([]);
    drawingId: DrawingInfo;

    constructor(private basicService: IndexService, public dialog: MatDialog) {}

    /*sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the clien',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important not to forget "subscribe" or the call will never be launched since no one is watching it
        this.basicService.basicPost(newTimeMessage).subscribe();
        console.log(newTimeMessage);
    }*/

    sendDrawingToServer(): void {
        const newDrawing: DrawingInfo = {
            id: 6,
            name: 'era',
            tags: ['a'],
            metadata: '',
        };
        this.basicService.postDrawing(newDrawing).subscribe();
    }

    getMessagesFromServer(): void {
        /*this.basicService
            .basicGet()
            // This step transforms the Message into a single string
            .pipe(
                map((message: Message) => {
                    console.log(message.title);
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);*/
    }

    getDrawingInfo(): void {
        this.basicService
            .getDrawing()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((drawingInfo: DrawingInfo[]) => {
                    // return `${drawingInfo.name} ${drawingInfo.tags}`;
                    // this.drawingInfo.next(drawingInfo);
                    return drawingInfo;
                }),
            )
            .subscribe(this.drawingsInfo);
        console.log(this.drawingsInfo.value.length);
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(GuideComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
    }
}
