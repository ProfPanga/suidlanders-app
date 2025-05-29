import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonToggle,
  IonText
} from '@ionic/angular/standalone';
import { MemberInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-member-info',
  templateUrl: './member-info.component.html',
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
    IonToggle,
    IonText
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MemberInfoComponent),
      multi: true
    }
  ]
})
export class MemberInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      lidNommer: [''],
      reddingsVerwysing: [''],
      bevelstruktuur: [''],
      radioRoepsein: [''],
      noodKontakNaam: ['', Validators.required],
      noodKontakNommer: ['', [Validators.required, Validators.pattern(/^(\+27|0)\d{9}$/)]],
      noodKontakVerwantskap: ['', Validators.required],
      wapenlisensie: [false],
      skietervaring: [''],
      ehboKwalifikasie: [false],
      ehboVlak: [''],
      ehboVervalDatum: ['']
    });

    // Subscribe to EHBO qualification changes
    this.form.get('ehboKwalifikasie')?.valueChanges.subscribe(hasEhbo => {
      const ehboVlakControl = this.form.get('ehboVlak');
      const ehboVervalDatumControl = this.form.get('ehboVervalDatum');

      if (hasEhbo) {
        ehboVlakControl?.setValidators([Validators.required]);
        ehboVervalDatumControl?.setValidators([Validators.required]);
      } else {
        ehboVlakControl?.clearValidators();
        ehboVervalDatumControl?.clearValidators();
        ehboVlakControl?.setValue('');
        ehboVervalDatumControl?.setValue('');
      }

      ehboVlakControl?.updateValueAndValidity();
      ehboVervalDatumControl?.updateValueAndValidity();
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: MemberInfo): void {
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
        if (controlName === 'noodKontakNommer') {
          return 'Ongeldige selfoon nommer formaat';
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

  isEhboFieldsVisible(): boolean {
    return this.form.get('ehboKwalifikasie')?.value === true;
  }
} 