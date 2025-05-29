import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect,
  IonSelectOption,
  IonText,
  IonItemDivider,
  IonItemGroup
} from '@ionic/angular/standalone';
import { CampInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-camp-info',
  templateUrl: './camp-info.component.html',
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
    IonItemDivider,
    IonItemGroup
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampInfoComponent),
      multi: true
    }
  ]
})
export class CampInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;
  today = new Date().toISOString();

  provinces = [
    'Gauteng',
    'Wes-Kaap',
    'Oos-Kaap',
    'Noord-Kaap',
    'KwaZulu-Natal',
    'Vrystaat',
    'Noordwes',
    'Limpopo',
    'Mpumalanga'
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      kampProvinsie: [''],
      kampNaam: [''],
      datumInKamp: ['']
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: CampInfo): void {
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