import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentOutline, qrCode } from 'ionicons/icons';
import { BasicInfoComponent } from '../basic-info/basic-info.component';
import { MemberInfoComponent } from '../member-info/member-info.component';
import { AddressInfoComponent } from '../address-info/address-info.component';
import { MedicalInfoComponent } from '../medical-info/medical-info.component';
import { VehicleInfoComponent } from '../vehicle-info/vehicle-info.component';
import { SkillsInfoComponent } from '../skills-info/skills-info.component';
import { EquipmentInfoComponent } from '../equipment-info/equipment-info.component';
import { CampInfoComponent } from '../camp-info/camp-info.component';
import { OtherInfoComponent } from '../other-info/other-info.component';
import { DocumentsInfoComponent } from '../documents-info/documents-info.component';
import { DependentsComponent } from '../dependents/dependents.component';
import { DatabaseService } from '../../../services/database.service';
import { ExportService } from '../../../services/export.service';
import { QRService } from '../../../services/qr.service';
import { SyncService } from '../../../services/sync.service';
// Interfaces are not used directly in this component; imports removed to satisfy linter
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-member-form',
  template: `
    <app-header title="Suidlander Inligtingsvorm"></app-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-accordion-group (ionChange)="onAccordionChange($event)">
          <ion-accordion id="accordion-basicInfo" value="basicInfo">
            <ion-item slot="header">
              <ion-label>Basiese Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-basic-info formControlName="basicInfo"></app-basic-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-addressInfo" value="addressInfo">
            <ion-item slot="header">
              <ion-label>Adres Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-address-info
                formControlName="addressInfo"
              ></app-address-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-medicalInfo" value="medicalInfo">
            <ion-item slot="header">
              <ion-label>Mediese Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-medical-info
                formControlName="medicalInfo"
              ></app-medical-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-vehicleInfo" value="vehicleInfo">
            <ion-item slot="header">
              <ion-label>Voertuig Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-vehicle-info
                formControlName="vehicleInfo"
              ></app-vehicle-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-skillsInfo" value="skillsInfo">
            <ion-item slot="header">
              <ion-label>Vaardighede & Ervaring</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-skills-info formControlName="skillsInfo"></app-skills-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-equipmentInfo" value="equipmentInfo">
            <ion-item slot="header">
              <ion-label>Toerusting & Hulpbronne</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-equipment-info
                formControlName="equipmentInfo"
              ></app-equipment-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-campInfo" value="campInfo">
            <ion-item slot="header">
              <ion-label>Kamp Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-camp-info formControlName="campInfo"></app-camp-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-otherInfo" value="otherInfo">
            <ion-item slot="header">
              <ion-label>Ander Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-other-info formControlName="otherInfo"></app-other-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-memberInfo" value="memberInfo">
            <ion-item slot="header">
              <ion-label>Lid Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-member-info formControlName="memberInfo"></app-member-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-documentsInfo" value="documentsInfo">
            <ion-item slot="header">
              <ion-label>Dokumente</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-documents-info
                formControlName="documentsInfo"
              ></app-documents-info>
            </div>
          </ion-accordion>

          <ion-accordion id="accordion-dependents" value="dependents">
            <ion-item slot="header">
              <ion-label>Afhanklikes</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-dependents formControlName="dependents"></app-dependents>
            </div>
          </ion-accordion>
        </ion-accordion-group>

        <div class="button-container ion-padding">
          <ion-button
            expand="block"
            (click)="onSubmit()"
            [disabled]="!form.valid || !form.dirty"
          >
            Dien Vorm In
          </ion-button>

          <ion-button
            expand="block"
            color="secondary"
            (click)="exportFormData()"
            class="ion-margin-top"
          >
            <ion-icon name="document-outline" slot="start"></ion-icon>
            Eksporteer as HTML
          </ion-button>

          <ion-button
            expand="block"
            color="tertiary"
            (click)="generateQRCode()"
            class="ion-margin-top"
          >
            <ion-icon name="qr-code" slot="start"></ion-icon>
            Genereer QR Kode
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            (click)="goToHome()"
            class="ion-margin-top"
          >
            Terug na Tuisblad
          </ion-button>
        </div>
      </form>

      <div *ngIf="submittedData" class="submitted-data">
        <h3>Ingedien:</h3>
        <pre>{{ submittedData | json }}</pre>
      </div>

      <!-- Toast notifications -->
      <ion-toast
        [isOpen]="showSuccessToast"
        message="Vorm suksesvol ingedien"
        duration="3000"
        position="top"
        color="success"
        cssClass="toast-center-text"
        (didDismiss)="showSuccessToast = false"
      ></ion-toast>

      <ion-toast
        [isOpen]="showErrorToast"
        [message]="errorMessage"
        duration="5000"
        position="top"
        color="danger"
        (didDismiss)="showErrorToast = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [
    `
      .section {
        background: transparent;
        border-left: 4px solid var(--ion-color-primary);
        border-radius: 4px;
      }

      .button-container {
        margin-top: 2rem;
      }

      .submitted-data {
        margin-top: 2rem;
        padding: 1rem;
        background: var(--ion-color-light);
        border-radius: 8px;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        background: var(--ion-color-step-100);
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      ion-accordion {
        margin-bottom: 0.5rem;
      }

      ion-accordion-group {
        margin-bottom: 1rem;
      }

      .toast-center-text::part(message) {
        text-align: center;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonToast,
    HeaderComponent,
    BasicInfoComponent,
    MemberInfoComponent,
    AddressInfoComponent,
    MedicalInfoComponent,
    VehicleInfoComponent,
    SkillsInfoComponent,
    EquipmentInfoComponent,
    CampInfoComponent,
    OtherInfoComponent,
    DocumentsInfoComponent,
    DependentsComponent,
  ],
})
export class MemberFormComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(BasicInfoComponent) basicInfoComponent!: BasicInfoComponent;

  // Toast notification properties
  showSuccessToast = false;
  showErrorToast = false;
  errorMessage = '';
  form: FormGroup;
  submittedData: any;

  // Custom validator for basic info section
  private basicInfoValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value = control.value;

    // If no value, let required validator handle it
    if (!value) {
      return null;
    }

    // Check if basic required fields have values
    // For testing purposes, only require ID Nommer
    const requiredFields = [
      'idNommer', // Only ID number required for testing
      // 'van',
      // 'noemNaam',
      // 'huistaal',
      // 'geslag',
      // 'ouderdom',
      // 'geboorteDatum',
      // 'cellNommer',
      // 'email',
      // 'huwelikStatus',
    ];
    const missingFields = requiredFields.filter(
      (field) => !value[field] || value[field].toString().trim() === ''
    );

    if (missingFields.length > 0) {
      return { missingRequiredFields: { fields: missingFields } };
    }

    // Additional validation checks
    if (value.idNommer && !/^\d{13}$/.test(value.idNommer)) {
      return { invalidIdNumber: true };
    }

    if (value.cellNommer && !/^(\+27|0)\d{9}$/.test(value.cellNommer)) {
      return { invalidCellNumber: true };
    }

    return null; // Valid
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly databaseService: DatabaseService,
    private readonly exportService: ExportService,
    private readonly qrService: QRService,
    private readonly syncService: SyncService
  ) {
    addIcons({ documentOutline, qrCode });
    this.form = this.fb.group({
      basicInfo: [null, [Validators.required, this.basicInfoValidator]], // Add custom validator
      memberInfo: [null],
      addressInfo: [null],
      medicalInfo: [null],
      vehicleInfo: [null],
      skillsInfo: [null],
      equipmentInfo: [null],
      campInfo: [null],
      otherInfo: [null],
      documentsInfo: [null],
      dependents: [[]],
    });
  }

  ngOnInit() {
    this.loadExistingMember();
  }

  private async loadExistingMember() {
    try {
      const existing = await this.databaseService.getCurrentMemberEntry();
      if (existing) {
        this.form.patchValue({
          basicInfo: existing.basicInfo || null,
          memberInfo: existing.memberInfo || null,
          addressInfo: existing.addressInfo || null,
          medicalInfo: existing.medicalInfo || null,
          vehicleInfo: existing.vehicleInfo || null,
          skillsInfo: existing.skillsInfo || null,
          equipmentInfo: existing.equipmentInfo || null,
          campInfo: existing.campInfo || null,
          otherInfo: existing.otherInfo || null,
          documentsInfo: existing.documentsInfo || null,
          dependents: existing.dependents || [],
        });
      }
    } catch (err) {
      console.error('Failed to load existing member entry:', err);
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        this.submittedData = this.form.value;
        console.log('Form submitted:', this.submittedData);

        // Save to the database
        await this.databaseService.saveEntry(this.submittedData);

        // Show success message
        this.showSuccessToast = true;
        // Mark form as pristine but keep values for further updates
        this.form.markAsPristine();

        // Immediately attempt a sync to backend for testing
        // Keeps offline-first: if offline, sync service will handle gracefully
        this.syncService.sync().subscribe({
          next: (result) => {
            console.log('Manual sync result:', result);
          },
          error: (error) => {
            console.error('Sync error:', error);
            // Don't show error for sync failures as the data is saved locally
          },
        });
      } catch (error) {
        console.error('Error saving form:', error);
        this.errorMessage = 'Fout by stoor van vorm. Probeer weer.';
        this.showErrorToast = true;
      }
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.form);
      this.errorMessage =
        'Vorm is nie volledig ingevul nie. Kontroleer alle velde.';
      this.showErrorToast = true;
    }
  }

  async onAccordionChange(event: CustomEvent) {
    try {
      const value = event.detail.value as string | null;
      if (!value || !this.content) return;

      const elementId = `accordion-${value}`;
      const el = document.getElementById(elementId);
      if (!el) return;

      const scrollEl = await this.content.getScrollElement();
      const header = document.querySelector('ion-header') as HTMLElement | null;
      const toolbarHeight = header?.clientHeight ?? 56;

      const elRect = el.getBoundingClientRect();
      const contentRect = scrollEl.getBoundingClientRect();

      // Distance of the accordion header from the top of the scrollable content
      const distanceFromTop = elRect.top - contentRect.top;
      // If already aligned (within 4px), skip
      if (Math.abs(distanceFromTop - toolbarHeight) <= 4) return;

      const currentTop = scrollEl.scrollTop;
      const elementTopWithinContent =
        currentTop + (elRect.top - contentRect.top);
      const targetY = Math.max(elementTopWithinContent - toolbarHeight, 0);
      await this.content.scrollToPoint(0, targetY, 300);
    } catch {
      // no-op
    }
  }

  async exportFormData() {
    if (this.form.valid) {
      try {
        await this.exportService.exportData(this.form.value);
      } catch (error) {
        console.error('Error exporting form data:', error);
      }
    }
  }

  async generateQRCode() {
    if (this.form.valid) {
      try {
        const basicInfo = this.form.get('basicInfo')?.value;
        const memberInfo = this.form.get('memberInfo')?.value;

        if (!basicInfo) {
          console.error('Basiese inligting ontbreek');
          return;
        }

        const qrData = {
          entryId: Date.now().toString(),
          van: basicInfo.van || '',
          noemNaam: basicInfo.noemNaam || '',
          lidNommer: memberInfo?.lidNommer || '',
          reddingsVerwysing: memberInfo?.reddingsVerwysing || '',
        };

        // Log the data being sent to QR generation
        console.log('Generating QR code with data:', qrData);

        await this.qrService.generateQRCode(qrData);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.form);
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
