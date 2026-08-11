import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  walletOutline,
  notificationsOutline,
  colorPaletteOutline,
  shieldCheckmarkOutline,
  logOutOutline,
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    RouterLink,
  ],
})
export class MorePage {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    addIcons({
      'wallet-outline': walletOutline,
      'notifications-outline': notificationsOutline,
      'color-palette-outline': colorPaletteOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'log-out-outline': logOutOutline,
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      },
    });
  }
}
