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
  IonItemDivider,
  IonItemGroup,
} from '@ionic/angular/standalone';
import { AddressInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-address-info',
  templateUrl: './address-info.component.html',
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
    IonItemDivider,
    IonItemGroup,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressInfoComponent),
      multi: true,
    },
  ],
})
export class AddressInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      straatAdres: ['', Validators.required],
      voorstad: ['', Validators.required],
      stad: ['', Validators.required],
      provinsie: ['', Validators.required],
      posKode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      woonagtig: ['', Validators.required],
      gpsKoordinate: this.fb.group({
        lat: ['', [Validators.pattern(/^-?([0-8]?[0-9]|90)\.[0-9]{1,8}$/)]],
        lng: [
          '',
          [Validators.pattern(/^-?((1[0-7]|[0-9])?[0-9]|180)\.[0-9]{1,8}$/)],
        ],
      }),
      naaste: this.fb.group({
        hospitaal: [''],
        hospitaalAfstand: ['', [Validators.min(0)]],
        polisie: [''],
        polisieAfstand: ['', [Validators.min(0)]],
        winkel: [''],
        winkelAfstand: ['', [Validators.min(0)]],
      }),
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: AddressInfo): void {
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
        switch (controlName) {
          case 'posKode':
            return 'Poskode moet 4 syfers wees';
          case 'gpsKoordinate.lat':
            return 'Ongeldige breedtegraad formaat';
          case 'gpsKoordinate.lng':
            return 'Ongeldige lengtegraad formaat';
          default:
            return 'Ongeldige formaat';
        }
      }
      if (control.errors['min']) {
        return `Minimum waarde is ${control.errors['min'].min}`;
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

  isNestedFieldInvalid(path: string): boolean {
    const control = this.form.get(path);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  getNestedErrorMessage(path: string): string {
    const control = this.form.get(path);
    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
      if (control.errors['min']) {
        return `Minimum waarde is ${control.errors['min'].min}`;
      }
      if (control.errors['pattern']) {
        if (path.includes('gpsKoordinate.lat')) {
          return 'Ongeldige breedtegraad formaat';
        } else if (path.includes('gpsKoordinate.lng')) {
          return 'Ongeldige lengtegraad formaat';
        }
      }
    }
    return '';
  }
}
