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
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonItemDivider,
  IonItemGroup,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-sekuriteits-info',
  templateUrl: './sekuriteits-info.component.html',
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
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonItemDivider,
    IonItemGroup,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SekuriteitsInfoComponent),
      multi: true,
    },
  ],
})
export class SekuriteitsInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      vuurwapen: [false],
      vuurwapenTipe: [''],
      wapenlisensie: [false],
      ammunisie: [false],
      skietervaring: [''],
      vuurwapenOpleiding: [false],
      selfverdediging: [false],
      sekuriteitsOndervinding: [false],
      sekuriteitsOndervindingBeskrywing: [''],
      sekuriteitsNotas: [''],
    });
  }

  writeValue(value: any): void {
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
}
