import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../services/role.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    HeaderComponent,
  ],
  template: `
    <app-header title="Aanmelding" [showBack]="true"></app-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="stacked">E-pos</ion-label>
          <ion-input formControlName="email" type="email" autocomplete="username"></ion-input>
        </ion-item>
        <ion-item class="ion-margin-top">
          <ion-label position="stacked">Wagwoord / ID Nommer</ion-label>
          <ion-input formControlName="password" type="password" autocomplete="current-password"></ion-input>
        </ion-item>

        <p class="hint">Personeel gebruik hul wagwoord. Lede gebruik hul ID nommer.</p>

        @if (errorMessage) {
          <ion-text color="danger">
            <p class="error">{{ errorMessage }}</p>
          </ion-text>
        }

        <ion-button
          expand="block"
          class="ion-margin-top"
          type="submit"
          [disabled]="form.invalid || loading"
          >{{ loading ? 'Besig...' : 'Teken In' }}</ion-button
        >
      </form>
    </ion-content>
  `,
  styles: [
    `.hint { font-size: 0.8rem; opacity: 0.7; margin-top: 0.75rem; }
     .error { margin: 0.75rem 0 0; font-weight: 600; }`,
  ],
})
export class LoginPage {
  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Where each role lands after a successful login.
  private readonly landing: Record<UserRole, string> = {
    [UserRole.MEMBER]:          '/home',
    [UserRole.RECEPTION_STAFF]: '/reception',
    [UserRole.MEDICAL_STAFF]:   '/member-form/medicalStaff',
    [UserRole.SECURITY_STAFF]:  '/member-form/securityStaff',
    [UserRole.ADMIN]:           '/reception',
  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([this.landing[res.user.role] ?? '/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.status === 401
            ? 'Ongeldige e-pos of wagwoord.'
            : 'Aanmelding het misluk. Probeer weer.';
      },
    });
  }
}
