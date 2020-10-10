import { Component } from '@angular/core';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.scss'],
})
export class GuideComponent {
    openTab(tab: string): void {
        let i: number;

        const tabElement = document.getElementById(tab);
        const tabcontent = document.getElementsByClassName('tabcontent') as HTMLCollectionOf<HTMLElement>;
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none';
        }

        const tablinks = document.getElementsByClassName('tablinks') as HTMLCollectionOf<HTMLElement>;
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }
        if (tabElement !== null) {
            tabElement.style.display = 'block';
        }
    }
}
