import {
  Component,
  forwardRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
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
  IonItemDivider,
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
    IonItemDivider,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BasicInfoComponent),
      multi: true,
    },
  ],
})
export class BasicInfoComponent
  implements OnInit, AfterViewInit, ControlValueAccessor
{
  form: FormGroup;
  isDisabled = false;
  maxDate: string;

  constructor(private readonly fb: FormBuilder) {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      entryId: [''],
      van: ['', [Validators.required, Validators.minLength(2)]],
      noemNaam: ['', [Validators.required, Validators.minLength(2)]],
      tweedeNaam: [''],
      huistaal: [''],
      huistaalAnder: [''],
      geslag: [''],
      ouderdom: ['', [Validators.min(0), Validators.max(120)]],
      geboorteDatum: [''],
      idNommer: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      cellNommer: ['', [Validators.pattern(/^(\+27|0)\d{9}$/)]],
      email: ['', [this.emailValidator]],
      huwelikStatus: [''],
      // Address fields
      straatAdres: [''],
      voorstad: [''],
      provinsie: [''],
      posKode: ['', [Validators.pattern(/^\d{4}$/)]],
      woonagtig: [''],
    });

    this.form.get('idNommer')?.valueChanges.subscribe((idNumber) => {
      if (idNumber?.length === 13) {
        this.extractDateFromIdNumber(idNumber);
      }
    });

    this.form.get('huistaal')?.valueChanges.subscribe((val) => {
      if (val === 'ander') {
        setTimeout(() => this.focusHuistaalAnder(), 0);
      } else {
        this.form.patchValue({ huistaalAnder: '' }, { emitEvent: false });
      }
    });

    this.form.get('geboorteDatum')?.valueChanges.subscribe((date) => {
      if (date) {
        const age = this.calculateAge(new Date(date));
        if (age >= 0 && age <= 120) {
          this.form.patchValue({ ouderdom: age }, { emitEvent: false });
        }
      }
    });

    this.form.get('ouderdom')?.valueChanges.subscribe((age) => {
      const birthDate = this.form.get('geboorteDatum')?.value;
      if (birthDate && age) {
        const calculatedAge = this.calculateAge(new Date(birthDate));
        if (calculatedAge !== Number.parseInt(age, 10)) {
          this.form.get('ouderdom')?.setErrors({ ageMismatch: true });
        }
      }
    });
  }

  ngOnInit() {
    this.generateNewId();
  }

  @ViewChild('huistaalAnderInput', { static: false }) huistaalAnderInput?: any;

  ngAfterViewInit(): void {
    if (this.form.get('huistaal')?.value === 'ander') {
      this.focusHuistaalAnder();
    }
  }

  private focusHuistaalAnder() {
    try {
      this.huistaalAnderInput?.setFocus?.();
    } catch {}
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const email = control.value.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) return { invalidEmail: true };
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) return { invalidEmail: true };

    const parts = email.split('.');
    if (parts[parts.length - 1].length < 2) return { invalidEmail: true };

    if (email.includes('.za')) {
      const validSADomains = ['co.za', 'org.za', 'gov.za', 'ac.za', 'net.za'];
      const lastTwoParts = parts.slice(-2).join('.');
      if (!validSADomains.includes(lastTwoParts)) return { invalidSADomain: true };
    }

    return null;
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

  private extractDateFromIdNumber(idNumber: string): void {
    try {
      const yearPart = idNumber.substring(0, 2);
      const monthPart = idNumber.substring(2, 4);
      const dayPart = idNumber.substring(4, 6);

      const currentYearLastTwo = new Date().getFullYear() % 100;
      const year = Number.parseInt(yearPart, 10);
      const fullYear = year > currentYearLastTwo ? 1900 + year : 2000 + year;

      const month = Number.parseInt(monthPart, 10);
      const day = Number.parseInt(dayPart, 10);

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        this.form.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      const dateString = `${fullYear}-${monthPart}-${dayPart}`;
      const birthDate = new Date(dateString);

      if (
        birthDate.getFullYear() !== fullYear ||
        birthDate.getMonth() !== month - 1 ||
        birthDate.getDate() !== day
      ) {
        this.form.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      // Digit at index 6: 0-4 = female, 5-9 = male
      const genderDigit = Number.parseInt(idNumber.charAt(6), 10);
      const geslag = genderDigit < 5 ? 'vroulik' : 'manlik';

      this.form.patchValue(
        { geboorteDatum: dateString, ouderdom: this.calculateAge(birthDate), geslag },
        { emitEvent: false }
      );

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
    const pad = (n: number) => String(n).padStart(2, '0');
    const newId = `ID${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    this.form.patchValue({ entryId: newId });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors || (!control.dirty && !control.touched)) return '';

    const e = control.errors;
    if (e['required']) return 'Hierdie veld is verpligtend';
    if (e['invalidEmail']) return "E-pos adres moet 'n geldige domein hê (bv. .com, .co.za)";
    if (e['invalidSADomain']) return 'Ongeldige Suid-Afrikaanse domein. Gebruik .co.za, .org.za, ens.';
    if (e['email']) return 'Ongeldige e-pos formaat';
    if (e['minlength']) return `Minimum lengte is ${e['minlength'].requiredLength} karakters`;
    if (e['min']) return `Minimum waarde is ${e['min'].min}`;
    if (e['max']) return `Maksimum waarde is ${e['max'].max}`;
    if (e['ageMismatch']) return 'Ouderdom stem nie ooreen met geboortedatum nie';
    if (e['invalidIdDate']) return 'Ongeldige datum in ID nommer';
    if (e['pattern']) {
      const patternMessages: Record<string, string> = {
        idNommer: 'ID nommer moet 13 syfers wees',
        cellNommer: 'Ongeldige selfoon nommer formaat',
        posKode: 'Poskode moet 4 syfers wees',
      };
      return patternMessages[controlName] ?? 'Ongeldige formaat';
    }
    return '';
  }

  get idNommerValid(): boolean {
    const c = this.form.get('idNommer');
    return c?.valid === true && !!c.value;
  }

  get geslagLabel(): string {
    const val = this.form.get('geslag')?.value;
    if (val === 'manlik') return 'Manlik';
    if (val === 'vroulik') return 'Vroulik';
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}
