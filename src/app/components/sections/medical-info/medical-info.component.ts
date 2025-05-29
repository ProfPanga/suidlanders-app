import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea
} from '@ionic/angular/standalone';
import { MedicalInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-medical-info',
  templateUrl: './medical-info.component.html',
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MedicalInfoComponent),
      multi: true
    }
  ]
})
export class MedicalInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      bloedGroep: ['', Validators.required],
      chroniesesiektes: [''],
      medikasie: [''],
      allergies: [''],
      medieseFonds: [''],
      medieseFondsNommer: [''],
      huisDokter: [''],
      huisDokterNommer: ['', [Validators.pattern(/^(\+27|0)\d{9}$/)]],
      medieseNotas: ['']
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: MedicalInfo): void {
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
      if (control.errors['pattern']) {
        if (controlName === 'huisDokterNommer') {
          return 'Ongeldige telefoonnommer formaat';
        }
        return 'Ongeldige formaat';
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }
} 