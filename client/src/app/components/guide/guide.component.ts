import { Component } from '@angular/core';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.scss'],
})
export class GuideComponent {
    openTab(tab: string): void {
        // Declare all variables
        let i: number;
        let tabcontent: any;
        let tablinks: any;

        tabcontent = document.getElementsByClassName('tabcontent');
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none';
        }

        tablinks = document.getElementsByClassName('tablinks');
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }

        // tslint:disable-next-line: no-non-null-assertion
        document.getElementById(tab)!.style.display = 'block';
    }
}
