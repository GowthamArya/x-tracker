import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, checkmarkCircleOutline, logoGoogle, shieldCheckmarkOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.page.html',
  styleUrls: ['./public-home.page.scss'],
  imports: [IonButton, IonContent, IonIcon, RouterLink],
})
export class PublicHomePage {
  constructor() {
    addIcons({ arrowForwardOutline, checkmarkCircleOutline, logoGoogle, shieldCheckmarkOutline, walletOutline });
  }
}
