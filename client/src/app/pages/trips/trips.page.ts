import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  airplaneOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  peopleOutline,
  shareOutline
} from 'ionicons/icons';

import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class TripsPage implements OnInit {

  trips: Trip[] = [];

  constructor(
    private readonly tripsService: TripsService,
    private readonly router: Router
  ) {
    addIcons({
      addOutline,
      airplaneOutline,
      arrowForwardOutline,
      chevronForwardOutline,
      peopleOutline,
      shareOutline
    });
  }

  ngOnInit(): void {
    this.loadTrips();
  }

  ionViewWillEnter(): void {
    this.loadTrips();
  }

  private loadTrips(): void {
    this.tripsService.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
      },
      error: (err) => {
        console.error('Failed to load trips', err);
      }
    });
  }

  createTrip(): void {
    this.router.navigate(['/tabs/trips/create']);
  }

  openTrip(trip: Trip): void {
    this.router.navigate(['/tabs/trips', trip.id]);
  }

  shareTrip(trip: Trip): void {
    // TODO: Use TripInvitesService to generate a real invite.
    // Do not share the internal trip URL as an invitation.
    this.openTrip(trip);
  }
}