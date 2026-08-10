import { Component } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonTabButton, IonLabel, IonText, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';

import {
  logoGoogle,
  walletOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  flashOutline
} from 'ionicons/icons';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonIcon,
    IonText,
    IonCard,
    IonCardContent
],
})
export class LoginPage {
  constructor() {
    addIcons({
      'logo-google': logoGoogle,
      'wallet-outline': walletOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'lock-closed-outline': lockClosedOutline,
      'flash-outline': flashOutline
    });
  }

  loginWithGoogle(): void {
    window.location.href =
      `${environment.apiUrl}/auth/google`;
  }
}