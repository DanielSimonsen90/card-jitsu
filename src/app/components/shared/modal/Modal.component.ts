import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-modal-dialog',
  templateUrl: 'Modal.component.html',
  styleUrl: 'Modal.component.scss',
  imports: [CommonModule],
})
export class ModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();
  
  @ViewChild('dialogElement') dialogElement!: ElementRef<HTMLDialogElement>;

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.dialogElement) this._onOpenChange(this.isOpen);
  }

  private _onOpenChange(value: boolean) {
    if (!this.dialogElement?.nativeElement) return;
    if (value) this.dialogElement.nativeElement.showModal();
    else this.dialogElement.nativeElement.close();
  }

  public onBackdropClick(event: MouseEvent) {
    // For dialog elements, check if click is on the dialog itself (backdrop)
    const rect = this.dialogElement.nativeElement.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      this.close();
    }
  }

  public close() {
    this.closeModal.emit();
  }

  public onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') this.close();
  }
}