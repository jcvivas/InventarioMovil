import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonItem, IonLabel, IonInput, IonButton
} from '@ionic/angular/standalone';

import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonItem, IonLabel, IonInput, IonButton
  ],
})
export class LoginPage {
  correo = '';
  contrasena = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onLogin() {
    try {
      this.loading = true;
      await this.auth.login(this.correo, this.contrasena);
      await this.router.navigateByUrl('/tabs/products', { replaceUrl: true });
    } finally {
      this.loading = false;
    }
  }
}
