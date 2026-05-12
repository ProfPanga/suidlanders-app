import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';

const TITLES: Record<string, string> = {
  medicalStaff:  'Mediese Personeel',
  securityStaff: 'Sekuriteit Personeel',
};

@Component({
  selector: 'app-staff-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    HeaderComponent,
  ],
  template: `
    <app-header [title]="title" [showBack]="true" backHref="/member-form"></app-header>
    <ion-content class="ion-padding">

      @if (staffKey === 'medicalStaff') {
        <form [formGroup]="form">

          <ion-item>
            <ion-label position="stacked">Hoe loop die pasiënt?</ion-label>
            <ion-select formControlName="loopStyl">
              <ion-select-option value="Regop">Regop</ion-select-option>
              <ion-select-option value="Kreupel">Kreupel</ion-select-option>
              <ion-select-option value="Vooroor gebuig">Vooroor gebuig</ion-select-option>
              <ion-select-option value="Gedra">Gedra</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nek vorentoe getrek?</ion-label>
            <ion-select formControlName="nekVorentoe">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Kan nek agtertoe/sywaarts buig?</ion-label>
            <ion-select formControlName="nekBuigbaar">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Koorsig?</ion-label>
            <ion-select formControlName="koorsig">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (koors)?</ion-label>
            <ion-input type="text" formControlName="koorsDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nek of hoofpyn?</ion-label>
            <ion-select formControlName="nekOfHoofpyn">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (hoofpyn)?</ion-label>
            <ion-input type="text" formControlName="hoofpynDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Vorige beroertes?</ion-label>
            <ion-select formControlName="vorigeBeroertes">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Beroerte tekens</ion-label>
            <ion-textarea formControlName="beroerteTekens" placeholder="Lys tekens"></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Oë voorkoms</ion-label>
            <ion-input type="text" formControlName="oeVoorkoms"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Tong voorkoms</ion-label>
            <ion-input type="text" formControlName="tongVoorkoms"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (tong)?</ion-label>
            <ion-input type="text" formControlName="tongDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Respiratoriese simptome</ion-label>
            <ion-textarea formControlName="respiratorieseSimptome" placeholder="Lys simptome"></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (respiratoriese)?</ion-label>
            <ion-input type="text" formControlName="respiratorieseDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Hart/Longe probleme</ion-label>
            <ion-textarea formControlName="hartLongProbleme" placeholder="Lys probleme"></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Vandag medikasie geneem?</ion-label>
            <ion-select formControlName="vandagMedikasieGeneem">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Hoes?</ion-label>
            <ion-select formControlName="hoes">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Wanneer hoes?</ion-label>
            <ion-input type="text" formControlName="hoesTye" placeholder="Dag/Nag/Albei"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Naarheid/Braking/Diarree?</ion-label>
            <ion-select formControlName="giSimptome">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (GI)?</ion-label>
            <ion-input type="text" formControlName="giDuur"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Stoel voorkoms</ion-label>
            <ion-input type="text" formControlName="stoelVoorkoms" placeholder="Waterig/Erwt sop/Rysagtig"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Buikpyn ligging</ion-label>
            <ion-input type="text" formControlName="buikpynLigging"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (buikpyn)?</ion-label>
            <ion-input type="text" formControlName="buikpynDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Rugpyn ligging</ion-label>
            <ion-input type="text" formControlName="rugpynLigging"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe lank (rugpyn)?</ion-label>
            <ion-input type="text" formControlName="rugpynDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Lyk angstig?</ion-label>
            <ion-select formControlName="angstig">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Borspyn/Hoofpyn?</ion-label>
            <ion-select formControlName="borsOfHoofpyn">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Ander pyn</ion-label>
            <ion-input type="text" formControlName="anderPyn"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Vel voorkoms</ion-label>
            <ion-input type="text" formControlName="velVoorkoms"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Ligging op liggaam (vel)</ion-label>
            <ion-input type="text" formControlName="velLigging"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Diabeet?</ion-label>
            <ion-select formControlName="diabeet">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Diabetes behandeling</ion-label>
            <ion-select formControlName="diabetesBehandeling">
              <ion-select-option value="Insulien">Insulien</ion-select-option>
              <ion-select-option value="Oraal">Oraal medikasie</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Vandag diabetes medikasie geneem?</ion-label>
            <ion-select formControlName="vandagDiabetesMedikasie">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Diabetes medikasie + ekstra voorraad?</ion-label>
            <ion-select formControlName="hetEkstraDiabetesMedikasie">
              <ion-select-option [value]="true">Ja</ion-select-option>
              <ion-select-option [value]="false">Nee</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Wanneer laas geëet?</ion-label>
            <ion-input type="text" formControlName="laasGeet"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Wat is geëet?</ion-label>
            <ion-input type="text" formControlName="laasKos"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Wanneer laas gedrink?</ion-label>
            <ion-input type="text" formControlName="laasGedrink"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Wat is gedrink?</ion-label>
            <ion-input type="text" formControlName="laasDrink"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Waterbron</ion-label>
            <ion-select formControlName="waterBron">
              <ion-select-option value="">Onbekend</ion-select-option>
              <ion-select-option value="Dam">Dam</ion-select-option>
              <ion-select-option value="Rivier">Rivier</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Watervloei</ion-label>
            <ion-select formControlName="waterVloei">
              <ion-select-option value="Vloeiend">Vloeiend</ion-select-option>
              <ion-select-option value="Stil">Stilstaand</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Hoe het die water gelyk?</ion-label>
            <ion-input type="text" formControlName="waterVoorkoms"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Hoe lank op voet gereis?</ion-label>
            <ion-input type="text" formControlName="stapReisDuur"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Mediese Notas</ion-label>
            <ion-textarea
              formControlName="medieseNotas"
              placeholder="Enige addisionele mediese inligting"
              [rows]="4"
              [autoGrow]="true"
            ></ion-textarea>
          </ion-item>

        </form>
      }

      @if (staffKey === 'securityStaff') {
        <p>This section is under development. Coming soon...</p>
      }

    </ion-content>
  `,
})
export class StaffPlaceholderPage {
  title: string;
  staffKey: string;
  form: FormGroup;

  constructor(route: ActivatedRoute, fb: FormBuilder) {
    this.staffKey = route.snapshot.data['staffKey'] as string;
    this.title = TITLES[this.staffKey] ?? this.staffKey;

    this.form = fb.group({
      loopStyl: [''],
      nekVorentoe: [''],
      nekBuigbaar: [''],
      koorsig: [''],
      koorsDuur: [''],
      nekOfHoofpyn: [''],
      hoofpynDuur: [''],
      vorigeBeroertes: [''],
      beroerteTekens: [''],
      oeVoorkoms: [''],
      tongVoorkoms: [''],
      tongDuur: [''],
      respiratorieseSimptome: [''],
      respiratorieseDuur: [''],
      hartLongProbleme: [''],
      vandagMedikasieGeneem: [''],
      hoes: [''],
      hoesTye: [''],
      giSimptome: [''],
      giDuur: [''],
      stoelVoorkoms: [''],
      buikpynLigging: [''],
      buikpynDuur: [''],
      rugpynLigging: [''],
      rugpynDuur: [''],
      angstig: [''],
      borsOfHoofpyn: [''],
      anderPyn: [''],
      velVoorkoms: [''],
      velLigging: [''],
      diabeet: [''],
      diabetesBehandeling: [''],
      vandagDiabetesMedikasie: [''],
      hetEkstraDiabetesMedikasie: [''],
      laasGeet: [''],
      laasKos: [''],
      laasGedrink: [''],
      laasDrink: [''],
      waterBron: [''],
      waterVloei: [''],
      waterVoorkoms: [''],
      stapReisDuur: [''],
      medieseNotas: [''],
    });
  }
}
