import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripInvitesService } from '../../services/trip-invites.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IonBackButton, IonButtons, IonContent, IonButton, IonHeader, IonIcon, IonLabel, IonSpinner, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { airplaneOutline, arrowForwardOutline, peopleOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-join-trip',
  templateUrl: './join-trip.page.html',
  styleUrls: ['./join-trip.page.scss'],
  imports: [CommonModule, IonContent, IonButton, IonSpinner, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonIcon]
})
export class JoinTripPage implements OnInit {
  token = '';
  invite: any = null;
  loading = true;
  error = '';
  isLoggedIn = false;
  joining = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly invites: TripInvitesService,
    private readonly auth: AuthService
  ) {
    addIcons({ airplaneOutline, arrowForwardOutline, peopleOutline, shieldCheckmarkOutline });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Invalid invite token.';
      this.loading = false;
      return;
    }

    this.invites.getInvite(this.token).subscribe({
      next: (i) => {
        this.invite = i;
        this.loading = false;
        this.checkAuth();
      },
      error: (err) => {
        this.error = 'Invite not found or expired.';
        this.loading = false;
      }
    });
  }

  private checkAuth(): void {
    this.auth.isLoggedIn().subscribe({ next: (v) => (this.isLoggedIn = v) });
  }

  login(): void {
    const returnUrl = window.location.href;
    window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  join(): void {
    this.joining = true;
    this.error = '';
    this.invites.joinInvite(this.token).subscribe({
      next: () => this.router.navigate([`/tabs/trips/${this.invite.tripId}`]),
      error: (e) => {
        console.error(e);
        this.error = 'Unable to join the trip. Please try again.';
        this.joining = false;
      }
    });
  }
}
