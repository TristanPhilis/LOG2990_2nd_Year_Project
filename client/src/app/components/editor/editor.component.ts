import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DrawingService } from '@app/services/drawing/drawing.service';
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

    constructor(private cd: ChangeDetectorRef, public toolService: ToolsService, private drawingService: DrawingService) {}

    ngAfterViewInit(): void {
        this.workzoneRect = this.workzone.nativeElement.getBoundingClientRect();
        this.cd.detectChanges();

        if (this.drawingService.drawingToLoad !== (undefined && '')) {
            this.drawingService.loadDrawing(this.drawingService.baseCtx);
            this.drawingService.drawingToLoad = '';
        }

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
