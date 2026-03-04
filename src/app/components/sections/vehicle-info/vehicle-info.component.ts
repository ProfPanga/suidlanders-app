import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  Validators,
} from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle,
  IonItemDivider,
  IonItemGroup,
} from '@ionic/angular/standalone';
import { VehicleInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 1rem;
      }
    `,
  ],
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
    IonToggle,
    IonItemDivider,
    IonItemGroup,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VehicleInfoComponent),
      multi: true,
    },
  ],
})
export class VehicleInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;
  currentYear = new Date().getFullYear();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      primereVoertuig: this.fb.group({
        model: [''],
        registrasieNommer: [''],
        brandstofTipe: [''],
        bandeToestand: [''],
      }),
      sekondereVoertuig: this.fb.group({
        model: [''],
        registrasieNommer: [''],
        brandstofTipe: [''],
        bandeToestand: [''],
      }),
      sleepwa: [false],
      sleepwaKapasiteit: [''],
    });

    // Subscribe to sleepwa changes to handle conditional validation
    this.form.get('sleepwa')?.valueChanges.subscribe((hasSleepwa) => {
      const sleepwaKapasiteitControl = this.form.get('sleepwaKapasiteit');
      if (hasSleepwa) {
        sleepwaKapasiteitControl?.setValidators([Validators.min(0)]);
      } else {
        sleepwaKapasiteitControl?.clearValidators();
        sleepwaKapasiteitControl?.setValue('');
      }
      sleepwaKapasiteitControl?.updateValueAndValidity();
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: VehicleInfo): void {
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

  getErrorMessage(controlName: string, groupName: string = ''): string {
    const control = groupName
      ? this.form.get(`${groupName}.${controlName}`)
      : this.form.get(controlName);

    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
      if (control.errors['min']) {
        if (controlName === 'jaar') {
          return 'Jaar moet na 1900 wees';
        }
        return `Minimum waarde is ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        if (controlName === 'jaar') {
          return `Jaar moet voor ${this.currentYear} wees`;
        }
        return `Maksimum waarde is ${control.errors['max'].max}`;
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string, groupName: string = ''): boolean {
    const control = groupName
      ? this.form.get(`${groupName}.${controlName}`)
      : this.form.get(controlName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  isSleepwaVisible(): boolean {
    return this.form.get('sleepwa')?.value === true;
  }
}
