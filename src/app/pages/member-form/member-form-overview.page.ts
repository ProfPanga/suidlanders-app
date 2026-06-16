import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, medkitOutline, carOutline,
  schoolOutline, buildOutline, mapOutline, documentTextOutline,
  qrCode, checkmarkCircleOutline, shieldOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { DatabaseService } from '../../services/database.service';
import { QRService } from '../../services/qr.service';
import { MemberFormStateService } from '../../services/member-form-state.service';
import { AuthService } from '../../services/auth.service';

interface SectionCard {
  key: string;
  label: string;
  icon: string;
}

const STAFF_VIEWS: SectionCard[] = [
  { key: 'medicalStaff',  label: 'Mediese Personeel',   icon: 'medkit-outline' },
  { key: 'securityStaff', label: 'Sekuriteit Personeel', icon: 'shield-outline' },
];

const SECTIONS: SectionCard[] = [
  { key: 'basicInfo',       label: 'Basiese Inligting',  icon: 'person-outline' },
  { key: 'required-fields', label: 'Verpligte Velde',    icon: 'checkmark-circle-outline' },
  { key: 'medicalInfo',  label: 'Mediese Inligting',    icon: 'medkit-outline' },
  { key: 'vehicleInfo',  label: 'Voertuig Inligting',   icon: 'car-outline' },
  { key: 'skillsInfo',   label: 'Vaardighede',          icon: 'school-outline' },
  { key: 'equipmentInfo',    label: 'Toerusting',           icon: 'build-outline' },
  { key: 'campInfo',         label: 'Kamp Inligting',       icon: 'map-outline' },
  { key: 'documentsInfo',    label: 'Dokumente',            icon: 'document-text-outline' },
  { key: 'sekuriteitsInfo',  label: 'Sekuriteits Inligting', icon: 'shield-outline' },
];

@Component({
  selector: 'app-member-form-overview',
  templateUrl: './member-form-overview.page.html',
  styleUrls: ['./member-form-overview.page.scss'],
  standalone: true,
  imports: [
    FormsModule, IonContent, IonButton, IonIcon, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonText, HeaderComponent,
  ],
})
export class MemberFormOverviewPage implements OnInit {
  sections = SECTIONS;
  staffViews = STAFF_VIEWS;

  // Optional member recovery-account card
  accountEmail = '';
  accountMessage = '';
  accountError = false;
  creatingAccount = false;
  accountCreated = false;

  constructor(
    private readonly router: Router,
    private readonly databaseService: DatabaseService,
    private readonly qrService: QRService,
    private readonly stateService: MemberFormStateService,
    private readonly auth: AuthService,
  ) {
    addIcons({
      personOutline, medkitOutline, carOutline,
      schoolOutline, buildOutline, mapOutline, documentTextOutline,
      qrCode, checkmarkCircleOutline, shieldOutline,
    });
  }

  ngOnInit(): void {
    this.loadEntry();
  }

  private async loadEntry(): Promise<void> {
    const entry = await this.databaseService.getCurrentMemberEntry();
    this.stateService.setEntry(entry || {});
    // Pre-fill the recovery-account email from what the member already entered.
    this.accountEmail = entry?.['basicInfo']?.email || '';
  }

  /** The recovery-account card only makes sense once a valid 13-digit ID is captured. */
  get canCreateRecoveryAccount(): boolean {
    const id = this.stateService.getEntry()?.['basicInfo']?.idNommer;
    return typeof id === 'string' && /^\d{13}$/.test(id);
  }

  async createRecoveryAccount(): Promise<void> {
    if (this.creatingAccount) return;
    const entry = this.stateService.getEntry();
    const idNommer: string = entry?.['basicInfo']?.idNommer;
    const memberId: string = entry?.['entryId'];
    const email = (this.accountEmail || '').trim();

    if (!email) {
      this.accountError = true;
      this.accountMessage = 'Voer asseblief jou e-pos in.';
      return;
    }

    this.creatingAccount = true;
    this.accountError = false;
    this.accountMessage = '';
    this.auth.createMemberAccount(email, idNommer, memberId).subscribe({
      next: () => {
        this.creatingAccount = false;
        this.accountCreated = true;
      },
      error: () => {
        this.creatingAccount = false;
        this.accountError = true;
        this.accountMessage = 'Kon nie die rekening skep nie. Probeer weer.';
      },
    });
  }

  hasData(key: string): boolean {
    return this.stateService.hasData(key);
  }

  navigateToSection(key: string) {
    this.router.navigate(['/member-form', key]);
  }

  async generateQR() {
    const entry = this.stateService.getEntry();
    if (!entry?.['basicInfo']) return;
    try {
      await this.qrService.generateQRCode({
        entryId: Date.now().toString(),
        van: entry['basicInfo'].van || '',
        noemNaam: entry['basicInfo'].noemNaam || '',
        lidNommer: entry['memberInfo']?.lidNommer || '',
        reddingsVerwysing: entry['memberInfo']?.reddingsVerwysing || '',
      });
    } catch (error) {
      console.error('QR error:', error);
    }
  }
}
