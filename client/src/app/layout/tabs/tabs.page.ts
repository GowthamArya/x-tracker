import { Component } from '@angular/core';

import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

import {
  homeOutline,
  receiptOutline,
  barChartOutline,
  menuOutline,
  carOutline,
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline,
      receiptOutline,
      barChartOutline,
      menuOutline,
      carOutline,
    });
  }
}