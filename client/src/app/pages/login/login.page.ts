import { Component } from '@angular/core';
import { IonButton, IonContent, IonIcon, IonTabButton, IonLabel, IonText, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
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
    IonCardContent,
    RouterLink
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
    const requestedReturnUrl = params.get('returnUrl');
    let returnUrl = `${window.location.origin}/tabs/dashboard`;

    if (requestedReturnUrl) {
      try {
        const target = new URL(requestedReturnUrl, window.location.origin);

        // Only resume navigation within this installed/web app. This prevents a
        // stale or hostile query parameter from redirecting a signed-in user away.
        if (target.origin === window.location.origin) {
          returnUrl = target.toString();
        }
      } catch {
        // A malformed return URL should never prevent sign-in.
      }
    }

    localStorage.setItem('xtracker_return_url', returnUrl);
    const url = `${environment.apiUrl}/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;

    // Use a top-level navigation for Google OAuth. This also works in Safari's
    // standalone PWA mode, where popup-based sign-in is unreliable.
    window.location.assign(url);
  }
}
