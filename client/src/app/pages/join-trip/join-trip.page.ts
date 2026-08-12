import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripInvitesService } from '../../services/trip-invites.service';
import { TripInvitesPage } from '../trips/trip-invites.page';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-join-trip',
  templateUrl: './join-trip.page.html',
  styleUrls: ['./join-trip.page.scss'],
  imports: [CommonModule, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner]
})
export class JoinTripPage implements OnInit {
  token = '';
  invite: any = null;
  loading = true;
  error = '';
  isLoggedIn = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly invites: TripInvitesService,
    private readonly auth: AuthService
  ) {}

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
    this.invites.joinInvite(this.token).subscribe({ next: () => this.router.navigate([`/tabs/trips/${this.invite.tripId}`]), error: (e) => { console.error(e); this.error = 'Unable to join the trip.'; } });
  }
}
