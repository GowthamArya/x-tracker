import { Component } from '@angular/core';
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

/** Adds the same pull-down reload gesture to any page content. */
@Component({
  selector: 'app-page-refresher',
  standalone: true,
  imports: [IonRefresher, IonRefresherContent],
  template: `
    <ion-refresher slot="fixed" (ionRefresh)="reload($event)">
      <ion-refresher-content
        pullingText="Pull to refresh"
        refreshingSpinner="crescent">
      </ion-refresher-content>
    </ion-refresher>
  `,
})
export class PageRefresherComponent {
  reload(event: { target: { complete: () => void } }): void {
    // Complete the native control before reloading so the gesture never gets
    // stuck if the browser delays the navigation.
    event.target.complete();
    window.location.reload();
  }
}
