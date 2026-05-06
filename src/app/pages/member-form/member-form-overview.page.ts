import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, cardOutline, medkitOutline, carOutline,
  schoolOutline, buildOutline, mapOutline, documentTextOutline,
  peopleOutline, qrCode, documentOutline, checkmarkCircleOutline, shieldOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../../components/header/header.component';
import { DatabaseService } from '../../services/database.service';
import { ExportService } from '../../services/export.service';
import { QRService } from '../../services/qr.service';
import { MemberFormStateService } from '../../services/member-form-state.service';

interface SectionCard {
  key: string;
  label: string;
  icon: string;
}

const STAFF_VIEWS: SectionCard[] = [
  { key: 'medicalStaff',  label: 'Mediese Personeel', icon: 'medkit-outline' },
  { key: 'securityStaff', label: 'Sekuriteit',         icon: 'shield-outline' },
];

const SECTIONS: SectionCard[] = [
  { key: 'basicInfo',       label: 'Basiese Inligting',  icon: 'person-outline' },
  { key: 'required-fields', label: 'Verpligte Velde',    icon: 'checkmark-circle-outline' },
  { key: 'memberInfo',      label: 'Lid Inligting',      icon: 'card-outline' },
  { key: 'medicalInfo',  label: 'Mediese Inligting',    icon: 'medkit-outline' },
  { key: 'vehicleInfo',  label: 'Voertuig Inligting',   icon: 'car-outline' },
  { key: 'skillsInfo',   label: 'Vaardighede',          icon: 'school-outline' },
  { key: 'equipmentInfo',label: 'Toerusting',           icon: 'build-outline' },
  { key: 'campInfo',     label: 'Kamp Inligting',       icon: 'map-outline' },
  { key: 'documentsInfo',label: 'Dokumente',            icon: 'document-text-outline' },
  { key: 'dependents',   label: 'Afhanklikes',          icon: 'people-outline' },
];

@Component({
  selector: 'app-member-form-overview',
  templateUrl: './member-form-overview.page.html',
  styleUrls: ['./member-form-overview.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, HeaderComponent],
})
export class MemberFormOverviewPage implements OnInit {
  sections = SECTIONS;
  staffViews = STAFF_VIEWS;

  constructor(
    private readonly router: Router,
    private readonly databaseService: DatabaseService,
    private readonly exportService: ExportService,
    private readonly qrService: QRService,
    private readonly stateService: MemberFormStateService,
  ) {
    addIcons({
      personOutline, cardOutline, medkitOutline, carOutline,
      schoolOutline, buildOutline, mapOutline, documentTextOutline,
      peopleOutline, qrCode, documentOutline, checkmarkCircleOutline, shieldOutline,
    });
  }

  ngOnInit(): void {
    this.loadEntry();
  }

  private async loadEntry(): Promise<void> {
    const entry = await this.databaseService.getCurrentMemberEntry();
    this.stateService.setEntry(entry || {});
  }

  hasData(key: string): boolean {
    return this.stateService.hasData(key);
  }

  navigateToSection(key: string) {
    this.router.navigate(['/member-form', key]);
  }

  async exportData() {
    const entry = this.stateService.getEntry();
    if (entry) {
      try {
        await this.exportService.exportData(entry as any);
      } catch (error) {
        console.error('Export error:', error);
      }
    }
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
