import { Component } from '@angular/core';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.scss'],
})
export class GuideComponent {
    tabcontent: any;
    tablinks: any;
    openTab(tab: string): void {
        let i: number;
        // tslint:disable-next-line: no-non-null-assertion
        const myAbsolutelyNotNullElement = window.document.getElementById(tab)!;
        this.tabcontent = document.getElementsByClassName('tabcontent');
        for (i = 0; i < this.tabcontent.length; i++) {
            this.tabcontent[i].style.display = 'none';
        }

        this.tablinks = document.getElementsByClassName('tablinks');
        for (i = 0; i < this.tablinks.length; i++) {
            this.tablinks[i].className = this.tablinks[i].className.replace(' active', '');
        }
        if (myAbsolutelyNotNullElement !== null) {
            myAbsolutelyNotNullElement.style.display = 'block';
        }
    }
}
