import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TripsService } from '../../services/trips.service';
import { IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { airplaneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonTextarea, IonLabel, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon]
})
export class CreateTripPage {
  name = '';
  description = '';

  constructor(private readonly tripsService: TripsService, private readonly router: Router) {
    addIcons({ airplaneOutline });
  }

  create(): void {
    const payload = { name: this.name.trim(), description: this.description.trim() };

    if (!payload.name) {
      return;
    }

    this.tripsService.createTrip(payload).subscribe({
      next: () => this.router.navigate(['/tabs/trips']),
      error: (err) => console.error('Failed to create trip', err)
    });
  }

  cancel(): void {
    this.router.navigate(['/tabs/trips']);
  }
}
