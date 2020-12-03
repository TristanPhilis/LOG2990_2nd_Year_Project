import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ToolsService } from '@app/services/tools/tools-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum anchorId {
    bottom,
    right,
    corner,
}

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnDestroy {
    @ViewChild('workzone', { static: false })
    workzone: ElementRef<HTMLDivElement>;

    @ViewChild('toolAttributeSidenav', { static: false })
    toolAttributeSidenav: MatSidenav;

    workzoneRect: DOMRect;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private cd: ChangeDetectorRef, public toolService: ToolsService) {}

    ngAfterViewInit(): void {
        this.workzoneRect = this.workzone.nativeElement.getBoundingClientRect();
        this.cd.detectChanges();

        this.toolService.toolSidenavToggle.pipe(takeUntil(this.unsubscribe$)).subscribe((value) => {
            if (value === true) {
                this.toolAttributeSidenav.open();
            } else {
                this.toolAttributeSidenav.close();
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
