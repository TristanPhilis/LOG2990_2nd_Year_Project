import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { DatabaseService } from '@app/services/database/database.service';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';
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

    constructor(private basicService: IndexService, public dialog: MatDialog,/* private databaseService: DatabaseService*/) {
      /*this.databaseService.populateDB();
      this.databaseService.getAllDrawings();*/
    }

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.basicService.basicPost(newTimeMessage).subscribe();
    }

    getMessagesFromServer(): void {
        this.basicService
            .basicGet()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(GuideComponent);

        dialogRef.afterClosed().subscribe((result) => {
            console.log(`Dialog result: ${result}`);
        });
    }
}
