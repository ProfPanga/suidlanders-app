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
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
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
      .row {
        display: flex;
        gap: 12px;
      }
      .row > * {
        flex: 1;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
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
    IonTextarea,
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
    return this.fb.group({
      id: [dep?.id || null],
      fullName: [dep?.fullName || '', [Validators.required]],
      idNommer: [dep?.idNommer || ''],
      geboorteDatum: [dep?.geboorteDatum || ''],
      ouderdom: [dep?.ouderdom ?? null],
      geslag: [dep?.geslag || ''],
      verhouding: [dep?.verhouding || 'Ander', [Validators.required]],
      allergies: [dep?.allergies || ''],
      chronies: [dep?.chronies || ''],
      medikasie: [dep?.medikasie || ''],
      notas: [dep?.notas || ''],
    });
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
      // Remove from local list after successful promotion
      this.removeDependent(index);
      alert('Afhanklike bevorder na Lid.');
    } catch (e) {
      alert('Kon nie afhanklike bevorder nie.');
    }
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
