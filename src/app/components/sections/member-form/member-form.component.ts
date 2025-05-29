import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  IonLabel
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
import { DatabaseService } from '../../../services/database.service';
import { ExportService } from '../../../services/export.service';
import { QRService } from '../../../services/qr.service';
import { 
  BasicInfo, 
  MemberInfo, 
  AddressInfo, 
  MedicalInfo, 
  VehicleInfo, 
  SkillsInfo,
  EquipmentInfo,
  CampInfo,
  OtherInfo,
  DocumentsInfo 
} from '../../../interfaces/form-sections.interface';

@Component({
  selector: 'app-member-form',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Lid Registrasie</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-accordion-group>
          <ion-accordion value="basicInfo">
            <ion-item slot="header">
              <ion-label>Basiese Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-basic-info formControlName="basicInfo"></app-basic-info>
            </div>
          </ion-accordion>

          <ion-accordion value="memberInfo">
            <ion-item slot="header">
              <ion-label>Lid Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-member-info formControlName="memberInfo"></app-member-info>
            </div>
          </ion-accordion>

          <ion-accordion value="addressInfo">
            <ion-item slot="header">
              <ion-label>Adres Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-address-info formControlName="addressInfo"></app-address-info>
            </div>
          </ion-accordion>

          <ion-accordion value="medicalInfo">
            <ion-item slot="header">
              <ion-label>Mediese Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-medical-info formControlName="medicalInfo"></app-medical-info>
            </div>
          </ion-accordion>

          <ion-accordion value="vehicleInfo">
            <ion-item slot="header">
              <ion-label>Voertuig Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-vehicle-info formControlName="vehicleInfo"></app-vehicle-info>
            </div>
          </ion-accordion>

          <ion-accordion value="skillsInfo">
            <ion-item slot="header">
              <ion-label>Vaardighede & Ervaring</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-skills-info formControlName="skillsInfo"></app-skills-info>
            </div>
          </ion-accordion>

          <ion-accordion value="equipmentInfo">
            <ion-item slot="header">
              <ion-label>Toerusting & Hulpbronne</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-equipment-info formControlName="equipmentInfo"></app-equipment-info>
            </div>
          </ion-accordion>

          <ion-accordion value="campInfo">
            <ion-item slot="header">
              <ion-label>Kamp Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-camp-info formControlName="campInfo"></app-camp-info>
            </div>
          </ion-accordion>

          <ion-accordion value="otherInfo">
            <ion-item slot="header">
              <ion-label>Ander Inligting</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-other-info formControlName="otherInfo"></app-other-info>
            </div>
          </ion-accordion>

          <ion-accordion value="documentsInfo">
            <ion-item slot="header">
              <ion-label>Dokumente</ion-label>
            </ion-item>
            <div class="section ion-padding" slot="content">
              <app-documents-info formControlName="documentsInfo"></app-documents-info>
            </div>
          </ion-accordion>
        </ion-accordion-group>

        <div class="button-container ion-padding">
          <ion-button expand="block" (click)="onSubmit()" [disabled]="!form.valid">
            Dien Vorm In
          </ion-button>

          <ion-button expand="block" color="secondary" (click)="exportFormData()" class="ion-margin-top">
            <ion-icon name="document-outline" slot="start"></ion-icon>
            Eksporteer as HTML
          </ion-button>

          <ion-button expand="block" color="tertiary" (click)="generateQRCode()" class="ion-margin-top">
            <ion-icon name="qr-code" slot="start"></ion-icon>
            Genereer QR Kode
          </ion-button>

          <ion-button expand="block" fill="outline" (click)="goToHome()" class="ion-margin-top">
            Terug na Tuisblad
          </ion-button>
        </div>
      </form>

      <div *ngIf="submittedData" class="submitted-data">
        <h3>Ingedien:</h3>
        <pre>{{ submittedData | json }}</pre>
      </div>
    </ion-content>
  `,
  styles: [`
    .section {
      background: var(--ion-color-light);
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
      background: var(--ion-color-light-shade);
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
  `],
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
    BasicInfoComponent,
    MemberInfoComponent,
    AddressInfoComponent,
    MedicalInfoComponent,
    VehicleInfoComponent,
    SkillsInfoComponent,
    EquipmentInfoComponent,
    CampInfoComponent,
    OtherInfoComponent,
    DocumentsInfoComponent
  ]
})
export class MemberFormComponent {
  form: FormGroup;
  submittedData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private databaseService: DatabaseService,
    private exportService: ExportService,
    private qrService: QRService
  ) {
    addIcons({ documentOutline, qrCode });
    this.form = this.fb.group({
      basicInfo: [null],
      memberInfo: [null],
      addressInfo: [null],
      medicalInfo: [null],
      vehicleInfo: [null],
      skillsInfo: [null],
      equipmentInfo: [null],
      campInfo: [null],
      otherInfo: [null],
      documentsInfo: [null]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submittedData = this.form.value;
      console.log('Form submitted:', this.submittedData);
      // Here you would typically save to the database
      this.databaseService.saveEntry(this.submittedData);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.form);
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
          reddingsVerwysing: memberInfo?.reddingsVerwysing || ''
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
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 