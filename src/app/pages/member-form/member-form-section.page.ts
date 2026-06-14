import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonButton, IonToast } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { BasicInfoComponent } from '../../components/sections/basic-info/basic-info.component';
import { MemberInfoComponent } from '../../components/sections/member-info/member-info.component';
import { MedicalInfoComponent } from '../../components/sections/medical-info/medical-info.component';
import { VehicleInfoComponent } from '../../components/sections/vehicle-info/vehicle-info.component';
import { SkillsInfoComponent } from '../../components/sections/skills-info/skills-info.component';
import { EquipmentInfoComponent } from '../../components/sections/equipment-info/equipment-info.component';
import { CampInfoComponent } from '../../components/sections/camp-info/camp-info.component';
import { DocumentsInfoComponent } from '../../components/sections/documents-info/documents-info.component';
import { DependentsComponent } from '../../components/sections/dependents/dependents.component';
import { SekuriteitsInfoComponent } from '../../components/sections/sekuriteits-info/sekuriteits-info.component';
import { DatabaseService } from '../../services/database.service';
import { MemberFormStateService } from '../../services/member-form-state.service';
import { SyncService } from '../../services/sync.service';

const SECTION_LABELS: Record<string, string> = {
  basicInfo:     'Basiese Inligting',
  memberInfo:    'Lid Inligting',
  medicalInfo:   'Mediese Inligting',
  vehicleInfo:   'Voertuig Inligting',
  skillsInfo:    'Vaardighede & Ervaring',
  equipmentInfo: 'Toerusting & Hulpbronne',
  campInfo:      'Kamp Inligting',
  documentsInfo:    'Dokumente',
  dependents:       'Afhanklikes',
  sekuriteitsInfo:  'Sekuriteits Inligting',
};

@Component({
  selector: 'app-member-form-section',
  templateUrl: './member-form-section.page.html',
  styleUrls: ['./member-form-section.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonToast,
    HeaderComponent,
    BasicInfoComponent,
    MemberInfoComponent,
    MedicalInfoComponent,
    VehicleInfoComponent,
    SkillsInfoComponent,
    EquipmentInfoComponent,
    CampInfoComponent,
    DocumentsInfoComponent,
    DependentsComponent,
    SekuriteitsInfoComponent,
  ],
})
export class MemberFormSectionPage implements OnInit, OnDestroy {
  sectionKey = '';
  sectionLabel = '';
  form: FormGroup;
  isSaving = false;
  showSuccessToast = false;
  showErrorToast = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly databaseService: DatabaseService,
    private readonly stateService: MemberFormStateService,
    private readonly syncService: SyncService,
  ) {
    this.form = this.fb.group({ sectionData: [null], dependentsData: [[]], memberInfoData: [null] });
  }

  ngOnInit(): void {
    this.loadSection();
  }

  ngOnDestroy(): void {
    if (this.form.dirty) {
      this.stateService.updateSection(this.sectionKey, this.form.get('sectionData')?.value);
      if (this.sectionKey === 'basicInfo') {
        this.stateService.updateSection('dependents', this.form.get('dependentsData')?.value);
        this.stateService.updateSection('memberInfo', this.form.get('memberInfoData')?.value);
      }
      this.persistToDb();
    }
  }

  async save(): Promise<void> {
    this.isSaving = true;
    try {
      this.stateService.updateSection(this.sectionKey, this.form.get('sectionData')?.value);
      if (this.sectionKey === 'basicInfo') {
        this.stateService.updateSection('dependents', this.form.get('dependentsData')?.value);
        this.stateService.updateSection('memberInfo', this.form.get('memberInfoData')?.value);
      }
      await this.persistToDb();
      this.form.markAsPristine();
      this.showSuccessToast = true;
    } catch {
      this.showErrorToast = true;
    } finally {
      this.isSaving = false;
    }
  }

  private async loadSection(): Promise<void> {
    this.sectionKey = this.route.snapshot.paramMap.get('section') || '';
    this.sectionLabel = SECTION_LABELS[this.sectionKey] || this.sectionKey;

    // Use in-memory cache if available (set by overview page); else load from DB
    const entry: Record<string, any> =
      this.stateService.getEntry() ??
      ((await this.databaseService.getCurrentMemberEntry()) || {});
    this.stateService.setEntry(entry);

    const defaultValue = this.sectionKey === 'dependents' ? [] : null;
    this.form.patchValue({ sectionData: entry[this.sectionKey] ?? defaultValue });
    if (this.sectionKey === 'basicInfo') {
      this.form.patchValue({ dependentsData: entry['dependents'] ?? [] });
      this.form.patchValue({ memberInfoData: entry['memberInfo'] ?? null });
    }
    this.form.markAsPristine();
  }

  private async persistToDb(): Promise<void> {
    const full = (await this.databaseService.getCurrentMemberEntry()) || {};
    full[this.sectionKey] = this.form.get('sectionData')?.value;
    if (this.sectionKey === 'basicInfo') {
      full['dependents'] = this.form.get('dependentsData')?.value;
      full['memberInfo'] = this.form.get('memberInfoData')?.value;
    }
    await this.databaseService.saveEntry(full);
    this.syncService.sync().subscribe({ error: () => {} });
  }
}
