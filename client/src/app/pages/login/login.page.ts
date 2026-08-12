import { Component } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonTabButton, IonLabel, IonText, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  logoGoogle,
  walletOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
  flashOutline
} from 'ionicons/icons';
import { environment } from '../../../environments/environment';
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
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    let url = `${environment.apiUrl}/auth/google`;
    if (returnUrl) {
      url += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    window.location.href = url;
  }
}