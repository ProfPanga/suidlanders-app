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
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonItemDivider,
  IonItemGroup,
} from '@ionic/angular/standalone';
import { SkillsInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-skills-info',
  templateUrl: './skills-info.component.html',
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
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonItemDivider,
    IonItemGroup,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillsInfoComponent),
      multi: true,
    },
  ],
})
export class SkillsInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;
  today = new Date().toISOString();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      beroep: [''],
      kwalifikasies: [''],
      spesialisVaardighede: [''],
      taleKennis: [''],
      rekenaarVaardig: [false],
      bestuurslisensie: this.fb.group({
        kode: [''],
        pdp: [false],
        vervalDatum: [''],
      }),
      noodhulp: this.fb.group({
        vlak: [''],
        vervalDatum: [''],
      }),
      radio: this.fb.group({
        amateurRadioLisensie: [false],
        roepsein: [''],
        toerusting: [''],
      }),
    });

    // Subscribe to radio license changes
    this.form
      .get('radio.amateurRadioLisensie')
      ?.valueChanges.subscribe((hasLicense) => {
        const roepseinControl = this.form.get('radio.roepsein');
        const toerustingControl = this.form.get('radio.toerusting');

        if (!hasLicense) {
          roepseinControl?.setValue('');
          toerustingControl?.setValue('');
        }

        roepseinControl?.updateValueAndValidity();
        toerustingControl?.updateValueAndValidity();
      });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: SkillsInfo): void {
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

  isRadioLicenseVisible(): boolean {
    return this.form.get('radio.amateurRadioLisensie')?.value === true;
  }
}
