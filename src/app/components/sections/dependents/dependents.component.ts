import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
  ControlValueAccessor,
} from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { addCircleOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DependentInfo } from '../../../interfaces/form-sections.interface';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-dependents',
  templateUrl: './dependents.component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .card {
        border-left: 4px solid var(--ion-color-primary);
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 10px;
        background: transparent;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      .actions ion-button {
        flex: 1;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonButton,
    IonIcon,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependentsComponent),
      multi: true,
    },
  ],
})
export class DependentsComponent implements ControlValueAccessor {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly databaseService: DatabaseService
  ) {
    addIcons({ addCircleOutline, trashOutline });
    this.form = this.fb.group({
      dependents: this.fb.array([]),
    });

    this.form.valueChanges.subscribe(() =>
      this.onChange(this.form.value.dependents)
    );
  }

  get dependents(): FormArray<FormGroup> {
    return this.form.get('dependents') as FormArray<FormGroup>;
  }

  private buildDependent(dep?: Partial<DependentInfo>): FormGroup {
    const group = this.fb.group({
      id: [dep?.id || null],
      verhouding: [dep?.verhouding || '', [Validators.required]],
      van: [dep?.van || '', [Validators.minLength(2)]],
      fullName: [dep?.fullName || '', [Validators.required, Validators.minLength(2)]],
      huistaal: [dep?.huistaal || ''],
      huistaalAnder: [dep?.huistaalAnder || ''],
      idNommer: [dep?.idNommer || '', [Validators.pattern(/^\d{13}$/)]],
      geboorteDatum: [dep?.geboorteDatum || ''],
      ouderdom: [dep?.ouderdom ?? null],
      geslag: [dep?.geslag || ''],
      cellNommer: [dep?.cellNommer || '', [Validators.pattern(/^(\+27|0)\d{9}$/)]],
      email: [dep?.email || ''],
      huwelikStatus: [dep?.huwelikStatus || ''],
      straatAdres: [dep?.straatAdres || ''],
      voorstad: [dep?.voorstad || ''],
      provinsie: [dep?.provinsie || ''],
      posKode: [dep?.posKode || '', [Validators.pattern(/^\d{4}$/)]],
      woonagtig: [dep?.woonagtig || ''],
      allergies: [dep?.allergies || ''],
      chronies: [dep?.chronies || ''],
      medikasie: [dep?.medikasie || ''],
      notas: [dep?.notas || ''],
    });

    group.get('idNommer')?.valueChanges.subscribe((idNumber) => {
      if (idNumber?.length === 13) {
        this.extractFromId(group, idNumber);
      }
    });

    group.get('huistaal')?.valueChanges.subscribe((val) => {
      if (val !== 'ander') {
        group.patchValue({ huistaalAnder: '' }, { emitEvent: false });
      }
    });

    return group;
  }

  addDependent(prefill?: Partial<DependentInfo>) {
    this.dependents.push(this.buildDependent(prefill));
    this.onChange(this.form.value.dependents);
  }

  removeDependent(index: number) {
    this.dependents.removeAt(index);
    this.onChange(this.form.value.dependents);
  }

  async promoteDependent(index: number) {
    const group = this.dependents.at(index) as FormGroup;
    const dep = group.value as DependentInfo;
    try {
      await this.databaseService.promoteDependent(dep);
      this.removeDependent(index);
    } catch (e) {
      console.error('Bevorder na Lid misluk:', e);
    }
  }

  isIdNommerValid(index: number): boolean {
    const c = this.dependents.at(index)?.get('idNommer');
    return c?.valid === true && !!c.value;
  }

  geslagLabel(index: number): string {
    const val = this.dependents.at(index)?.get('geslag')?.value;
    if (val === 'manlik') return 'Manlik';
    if (val === 'vroulik') return 'Vroulik';
    return '';
  }

  isFieldInvalid(index: number, controlName: string): boolean {
    const control = this.dependents.at(index)?.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(index: number, controlName: string): string {
    const control = this.dependents.at(index)?.get(controlName);
    if (!control?.errors || (!control.dirty && !control.touched)) return '';

    const e = control.errors;
    if (e['required']) return 'Hierdie veld is verpligtend';
    if (e['minlength']) return `Minimum lengte is ${e['minlength'].requiredLength} karakters`;
    if (e['invalidIdDate']) return 'Ongeldige datum in ID nommer';
    if (e['pattern']) {
      const msgs: Record<string, string> = {
        idNommer: 'ID nommer moet 13 syfers wees',
        cellNommer: 'Ongeldige selfoon nommer formaat',
        posKode: 'Poskode moet 4 syfers wees',
      };
      return msgs[controlName] ?? 'Ongeldige formaat';
    }
    return '';
  }

  private extractFromId(group: FormGroup, idNumber: string): void {
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
        group.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      const dateString = `${fullYear}-${monthPart}-${dayPart}`;
      const birthDate = new Date(dateString);

      if (
        birthDate.getFullYear() !== fullYear ||
        birthDate.getMonth() !== month - 1 ||
        birthDate.getDate() !== day
      ) {
        group.get('idNommer')?.setErrors({ invalidIdDate: true });
        return;
      }

      const genderDigit = Number.parseInt(idNumber.charAt(6), 10);
      const geslag = genderDigit < 5 ? 'vroulik' : 'manlik';

      group.patchValue(
        { geboorteDatum: dateString, ouderdom: this.calculateAge(birthDate), geslag },
        { emitEvent: false }
      );

      const idErrors = group.get('idNommer')?.errors;
      if (idErrors) {
        delete idErrors['invalidIdDate'];
        if (Object.keys(idErrors).length === 0) {
          group.get('idNommer')?.setErrors(null);
        }
      }
    } catch {
      group.get('idNommer')?.setErrors({ invalidIdDate: true });
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

  // ControlValueAccessor
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: DependentInfo[] | null): void {
    this.dependents.clear();
    if (Array.isArray(value)) {
      for (const d of value) this.dependents.push(this.buildDependent(d));
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.form.disable();
    else this.form.enable();
  }
}
