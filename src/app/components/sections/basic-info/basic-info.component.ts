import { Component, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { BasicInfo } from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
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
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BasicInfoComponent),
      multi: true,
    },
  ],
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
      ouderdom: [
        '',
        [Validators.required, Validators.min(0), Validators.max(120)],
      ],
      geboorteDatum: ['', Validators.required],
      idNommer: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      cellNommer: [
        '',
        [Validators.required, Validators.pattern(/^(\+27|0)\d{9}$/)],
      ],
      email: ['', [Validators.required, this.emailValidator]],
      huwelikStatus: ['', Validators.required],
    });

    // Subscribe to ID number changes to extract birth date and age
    this.form.get('idNommer')?.valueChanges.subscribe((idNumber) => {
      if (idNumber && idNumber.length === 13) {
        this.extractDateFromIdNumber(idNumber);
      }
    });

    // Keep the existing age calculation for manual date changes
    this.form.get('geboorteDatum')?.valueChanges.subscribe((date) => {
      if (date) {
        const age = this.calculateAge(new Date(date));
        if (age >= 0 && age <= 120) {
          this.form.patchValue({ ouderdom: age }, { emitEvent: false });
        }
      }
    });

    // Subscribe to age changes to validate against birth date
    this.form.get('ouderdom')?.valueChanges.subscribe((age) => {
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

  // Custom email validator
  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const email = control.value.toLowerCase().trim();

    // Basic email regex that requires proper domain extension
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }

    // Additional checks for common issues
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { invalidEmail: true };
    }

    // Check for valid domain extension (at least 2 characters)
    const parts = email.split('.');
    const extension = parts[parts.length - 1];
    if (extension.length < 2) {
      return { invalidEmail: true };
    }

    // Check for South African domains specifically
    const validSADomains = ['co.za', 'org.za', 'gov.za', 'ac.za', 'net.za'];
    const lastTwoParts = parts.slice(-2).join('.');

    // If it looks like a SA domain, validate it properly
    if (email.includes('.za')) {
      if (!validSADomains.includes(lastTwoParts)) {
        return { invalidSADomain: true };
      }
    }

    return null; // Valid email
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

  // Extract birth date from South African ID number
  private extractDateFromIdNumber(idNumber: string): void {
    try {
      // SA ID format: YYMMDDNNNNNNC
      // First 6 digits are birth date (YYMMDD)
      const yearPart = idNumber.substring(0, 2);
      const monthPart = idNumber.substring(2, 4);
      const dayPart = idNumber.substring(4, 6);

      // Determine century (if YY > current year's last 2 digits, assume 1900s, else 2000s)
      const currentYear = new Date().getFullYear();
      const currentYearLastTwo = currentYear % 100;
      const year = parseInt(yearPart);

      let fullYear: number;
      if (year > currentYearLastTwo) {
        fullYear = 1900 + year;
      } else {
        fullYear = 2000 + year;
      }

      const month = parseInt(monthPart);
      const day = parseInt(dayPart);

      // Validate date components
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        this.form.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      // Create date string in YYYY-MM-DD format
      const dateString = `${fullYear}-${monthPart}-${dayPart}`;

      // Validate that it's a real date
      const birthDate = new Date(dateString);
      if (
        birthDate.getFullYear() !== fullYear ||
        birthDate.getMonth() !== month - 1 ||
        birthDate.getDate() !== day
      ) {
        this.form.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      // Update form fields
      this.form.patchValue(
        {
          geboorteDatum: dateString,
          ouderdom: this.calculateAge(birthDate),
        },
        { emitEvent: false }
      );

      // Clear any previous ID number errors
      const idErrors = this.form.get('idNommer')?.errors;
      if (idErrors) {
        delete idErrors['invalidIdDate'];
        if (Object.keys(idErrors).length === 0) {
          this.form.get('idNommer')?.setErrors(null);
        }
      }
    } catch (error) {
      console.error('Error extracting date from ID number:', error);
      this.form.get('idNommer')?.setErrors({ invalidIdDate: true });
    }
  }

  // Helper methods
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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
      if (control.errors['invalidEmail']) {
        return "E-pos adres moet 'n geldige domein hê (bv. .com, .co.za)";
      }
      if (control.errors['invalidSADomain']) {
        return 'Ongeldige Suid-Afrikaanse domein. Gebruik .co.za, .org.za, ens.';
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
      if (control.errors['invalidIdDate']) {
        return 'Ongeldige datum in ID nommer';
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
}
