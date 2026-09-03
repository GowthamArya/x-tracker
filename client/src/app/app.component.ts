import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [AsyncPipe, IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon, IonSpinner],
})
export class AppComponent {
  readonly loading$ = this.loading.loading$;

  constructor(private readonly loading: LoadingService) {
    addIcons({ refreshOutline });
  }

  reload(): void {
    window.location.reload();
  }
}
