import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonItemDivider,
  IonItemGroup,
} from '@ionic/angular/standalone';
import { DocumentsInfo } from '../../../interfaces/form-sections.interface';
import { addCircleOutline, documentOutline, closeCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-documents-info',
  templateUrl: './documents-info.component.html',
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 1rem;
      }

      .file-input {
        display: none;
      }

      .upload-button {
        margin: 1rem 0;
      }

      .file-list {
        margin: 1rem 0;
      }

      .file-item {
        display: flex;
        align-items: center;
        margin: 0.5rem 0;
        padding: 0.5rem;
        background: var(--ion-color-light);
        border-radius: 4px;
      }

      .file-name {
        flex: 1;
        margin-left: 0.5rem;
      }

      .file-size {
        color: var(--ion-color-medium);
        font-size: 0.8rem;
        margin-left: 0.5rem;
      }

      .helper-text {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        margin-top: 0.25rem;
        margin-left: 1rem;
      }

      ion-chip {
        margin: 0.25rem;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonItemDivider,
    IonItemGroup,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentsInfoComponent),
      multi: true,
    },
  ],
})
export class DocumentsInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png';
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private fb: FormBuilder) {
    addIcons({ addCircleOutline, documentOutline, closeCircle });

    this.form = this.fb.group({
      idDokument: [null],
      bestuurslisensie: [null],
      vuurwapenlisensie: [null],
      ehboSertifikaat: [null],
      ander: [[]],
    });
  }

  // File handling methods
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        if (controlName === 'ander') {
          const currentFiles = this.form.get('ander')?.value || [];
          this.form.patchValue({
            ander: [...currentFiles, file],
          });
        } else {
          this.form.patchValue({
            [controlName]: file,
          });
        }
        this.onChange(this.form.value);
      }
    }
  }

  removeFile(controlName: string, index?: number) {
    if (controlName === 'ander' && typeof index === 'number') {
      const currentFiles = [...this.form.get('ander')?.value];
      currentFiles.splice(index, 1);
      this.form.patchValue({ ander: currentFiles });
    } else {
      this.form.patchValue({ [controlName]: null });
    }
    this.onChange(this.form.value);
  }

  validateFile(file: File): boolean {
    if (file.size > this.maxFileSize) {
      alert('Lêer is te groot. Maksimum grootte is 5MB.');
      return false;
    }

    const fileType = file.name.toLowerCase().split('.').pop();
    const validTypes = this.acceptedFileTypes
      .split(',')
      .map((type) => type.replace('.', ''));
    if (!fileType || !validTypes.includes(fileType)) {
      alert('Ongeldige lêertipe. Aanvaarde tipes: PDF, JPG, JPEG, PNG');
      return false;
    }

    return true;
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileName(controlName: string): string {
    const file = this.form.get(controlName)?.value;
    return file ? file.name : '';
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: DocumentsInfo): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.form.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
