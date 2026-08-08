import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';

import {
  homeOutline,
  receiptOutline,
  barChartOutline,
  menuOutline,
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
  ],
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline,
      receiptOutline,
      barChartOutline,
      menuOutline,
    });
  }
}