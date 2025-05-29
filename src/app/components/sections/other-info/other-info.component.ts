import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonTextarea,
  IonText,
  IonItemDivider,
  IonItemGroup
} from '@ionic/angular/standalone';
import { OtherInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-other-info',
  templateUrl: './other-info.component.html',
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    ion-textarea {
      min-height: 100px;
    }

    .helper-text {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      margin-top: 0.25rem;
      margin-left: 1rem;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonTextarea,
    IonText,
    IonItemDivider,
    IonItemGroup
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtherInfoComponent),
      multi: true
    }
  ]
})
export class OtherInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      addisioneleNotas: [''],
      spesialeVaardighede: [''],
      belangstellings: [''],
      beskikbaarheid: [''],
      vrywilligerWerk: ['']
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: OtherInfo): void {
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
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }
} 