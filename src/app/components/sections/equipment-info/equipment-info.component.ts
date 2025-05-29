import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonToggle,
  IonText,
  IonItemDivider,
  IonItemGroup,
  IonRange
} from '@ionic/angular/standalone';
import { EquipmentInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-equipment-info',
  templateUrl: './equipment-info.component.html',
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .range-value {
      float: right;
      font-weight: bold;
    }

    ion-range {
      padding-top: 8px;
      padding-bottom: 8px;
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
    IonText,
    IonItemDivider,
    IonItemGroup,
    IonRange
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EquipmentInfoComponent),
      multi: true
    }
  ]
})
export class EquipmentInfoComponent implements ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      kommunikasie: this.fb.group({
        radio: [false],
        satellietFoon: [false],
        tweerigtingRadio: [false]
      }),
      kragOpwekking: this.fb.group({
        kragOpwekker: [false],
        sonkragStelsel: [false],
        omvormer: [false]
      }),
      waterBronne: this.fb.group({
        boorgat: [false],
        waterTenk: [false],
        waterFiltrasieStelsel: [false]
      }),
      verdediging: this.fb.group({
        vuurwapens: [false],
        lisensies: [false],
        opleiding: [false]
      }),
      kampering: this.fb.group({
        tent: [false],
        slaapsak: [false],
        kampToerusting: [false]
      }),
      noodvoorraad: this.fb.group({
        kos: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
        water: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
        brandstof: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
        medies: [false]
      })
    });
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: EquipmentInfo): void {
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
    const control = groupName ? 
      this.form.get(`${groupName}.${controlName}`) : 
      this.form.get(controlName);

    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
      if (control.errors['min']) {
        return `Minimum waarde is ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Maksimum waarde is ${control.errors['max'].max}`;
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string, groupName: string = ''): boolean {
    const control = groupName ? 
      this.form.get(`${groupName}.${controlName}`) : 
      this.form.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  formatDays(value: number): string {
    return `${value} dae`;
  }
} 