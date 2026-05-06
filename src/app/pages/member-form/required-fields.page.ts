import { Component } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonListHeader,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';

interface RequiredField {
  field: string;
  description: string;
  status: 'active' | 'planned';
}

interface SectionFields {
  section: string;
  fields: RequiredField[];
}

const REQUIRED_FIELDS: SectionFields[] = [
  {
    section: 'Basiese Inligting',
    fields: [
      { field: 'ID Nommer',  description: '13-syfer Suid-Afrikaanse ID', status: 'active' },
      { field: 'Volle Naam', description: 'Voor- en tweede naam',        status: 'active' },
      { field: 'Van',        description: 'Van / familienaam',           status: 'active' },
    ],
  },
];

@Component({
  selector: 'app-required-fields',
  template: `
    <app-header
      title="Verpligte Velde"
      [showBack]="true"
      backHref="/member-form"
    ></app-header>

    <ion-content class="ion-padding">
      <ion-note
        class="ion-padding-bottom"
        style="display:block; margin-bottom: 16px;"
      >
        <strong>Aktief</strong> = tans afgedwing. <strong>Beplan</strong> =
        toekomstige fase.
      </ion-note>

      @for (section of sections; track section.section) {
      <ion-list-header>{{ section.section }}</ion-list-header>
      <ion-list [inset]="true">
        @for (field of section.fields; track field.field) {
        <ion-item>
          <ion-label>
            <h3>{{ field.field }}</h3>
            <p>{{ field.description }}</p>
          </ion-label>
          <ion-badge
            slot="end"
            [color]="field.status === 'active' ? 'success' : 'medium'"
          >
            {{ field.status === 'active' ? 'Aktief' : 'Beplan' }}
          </ion-badge>
        </ion-item>
        }
      </ion-list>
      }
    </ion-content>
  `,
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonNote,
    IonListHeader,
    HeaderComponent,
  ],
})
export class RequiredFieldsPage {
  sections = REQUIRED_FIELDS;
}
