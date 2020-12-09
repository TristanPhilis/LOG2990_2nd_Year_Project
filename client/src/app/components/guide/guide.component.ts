import { Component } from '@angular/core';

@Component({
    selector: 'app-guide',
    templateUrl: './guide.component.html',
    styleUrls: ['./guide.component.scss'],
})
export class GuideComponent {
    private tabElement: HTMLElement | null;
    private tabContent: HTMLCollectionOf<HTMLElement>;
    openTab(tab: string): void {
        let i: number;

        this.tabElement = document.getElementById(tab);
        this.tabContent = document.getElementsByClassName('tabcontent') as HTMLCollectionOf<HTMLElement>;
        for (i = 0; i < this.tabContent.length; i++) {
            this.tabContent[i].style.display = 'none';
        }

        const tablinks = document.getElementsByClassName('tablinks') as HTMLCollectionOf<HTMLElement>;
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
        }
        if (this.tabElement) {
            this.tabElement.style.display = 'block';
        }
    }
}
