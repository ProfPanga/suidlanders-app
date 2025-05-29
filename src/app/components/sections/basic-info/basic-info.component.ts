import { Component, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor, Validators } from '@angular/forms';
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonText
} from '@ionic/angular/standalone';
import { BasicInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
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
    IonText
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BasicInfoComponent),
      multi: true
    }
  ]
})
export class BasicInfoComponent implements OnInit, ControlValueAccessor {
  form: FormGroup;
  isDisabled = false;
  maxDate: string;

  constructor(private fb: FormBuilder) {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      entryId: [''],
      van: ['', [Validators.required, Validators.minLength(2)]],
      noemNaam: ['', [Validators.required, Validators.minLength(2)]],
      tweedeNaam: [''],
      huistaal: ['', Validators.required],
      geslag: ['', Validators.required],
      ouderdom: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      geboorteDatum: ['', Validators.required],
      idNommer: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      cellNommer: ['', [Validators.required, Validators.pattern(/^(\+27|0)\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      huwelikStatus: ['', Validators.required]
    });

    // Subscribe to date changes to update age automatically
    this.form.get('geboorteDatum')?.valueChanges.subscribe(date => {
      if (date) {
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age >= 0 && age <= 120) {
          this.form.patchValue({ ouderdom: age }, { emitEvent: false });
        }
      }
    });

    // Subscribe to age changes to validate against birth date
    this.form.get('ouderdom')?.valueChanges.subscribe(age => {
      const birthDate = this.form.get('geboorteDatum')?.value;
      if (birthDate && age) {
        const calculatedAge = this.calculateAge(new Date(birthDate));
        if (calculatedAge !== parseInt(age)) {
          this.form.get('ouderdom')?.setErrors({ ageMismatch: true });
        }
      }
    });
  }

  ngOnInit() {
    this.generateNewId();
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: BasicInfo): void {
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

  // Helper methods
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private generateNewId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const newId = `ID${year}${month}${day}${hours}${minutes}${seconds}`;
    this.form.patchValue({ entryId: newId });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
      if (control.errors['email']) {
        return 'Ongeldige e-pos formaat';
      }
      if (control.errors['minlength']) {
        return `Minimum lengte is ${control.errors['minlength'].requiredLength} karakters`;
      }
      if (control.errors['pattern']) {
        switch (controlName) {
          case 'idNommer':
            return 'ID nommer moet 13 syfers wees';
          case 'cellNommer':
            return 'Ongeldige selfoon nommer formaat';
          default:
            return 'Ongeldige formaat';
        }
      }
      if (control.errors['min']) {
        return `Minimum waarde is ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Maksimum waarde is ${control.errors['max'].max}`;
      }
      if (control.errors['ageMismatch']) {
        return 'Ouderdom stem nie ooreen met geboortedatum nie';
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }
} 