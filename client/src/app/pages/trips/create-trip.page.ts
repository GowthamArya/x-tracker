import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TripsService } from '../../services/trips.service';
import { IonContent, IonButton, IonInput, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonLabel]
})
export class CreateTripPage {
  name = '';
  description = '';

  constructor(private readonly tripsService: TripsService, private readonly router: Router) {}

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
