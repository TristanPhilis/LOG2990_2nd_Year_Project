import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ValidatorService } from '@app/services/validator-service';
import { DrawingInfo } from '@common/communication/drawing-info';

@Component({
    selector: 'app-save-popup',
    templateUrl: './save-popup.component.html',
    styleUrls: ['./save-popup.component.scss'],
})
export class SavePopupComponent implements OnInit {
    nameInput: FormControl;
    tagInput: FormControl;
    tags: string[];
    constructor(private drawingService: DrawingService, private validatorService: ValidatorService, private webRequestService: IndexService) {}

    ngOnInit(): void {
        this.nameInput = new FormControl('', [Validators.required]);
        this.tagInput = new FormControl('', [this.validatorService.isValidTag()]);
        this.tags = new Array();
    }

    addTag(): void {
        if (!this.tags.includes(this.tagInput.value)) {
            this.tags.push(this.tagInput.value);
        }
        this.tagInput.reset();
    }

    deleteTag(name: string): void {
        this.tags.splice(this.tags.indexOf(name), 1);
    }

    saveDrawing(): void {
        const drawing: DrawingInfo = {
            id: this.webRequestService.nextDrawingId,
            name: this.nameInput.value.toString(),
            tags: this.tags,
            metadata: this.drawingService.getImageURL(),
        };
        this.webRequestService.postDrawing(drawing)?.subscribe();
    }
}
