import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripInvitesService } from '../../services/trip-invites.service';
import { TripInvite } from '../../models/trip-invite.model';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-trip-invites',
  templateUrl: './trip-invites.page.html',
  styleUrls: ['./trip-invites.page.scss'],
  imports: [CommonModule, IonContent, IonButton]
})
export class TripInvitesPage implements OnInit {
  tripId = 0;
  invite: TripInvite | null = null;
  inviteUrl = '';
  qrUrl = '';

  constructor(private readonly route: ActivatedRoute, private readonly invites: TripInvitesService, private readonly toastCtrl: ToastController) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) return;
    this.tripId = id;
  }

  create(): void {
    this.invites.createInvite(this.tripId).subscribe({ next: (i) => this.setInvite(i), error: (e) => console.error(e) });
  }

  private setInvite(i: TripInvite): void {
    this.invite = i;
    this.inviteUrl = `${window.location.origin}/join/trip/${i.token}`;
    this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.inviteUrl)}`;
  }

  async copy(): Promise<void> {
    if (!this.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(this.inviteUrl);
      const t = await this.toastCtrl.create({ message: 'Copied invite link', duration: 1500, position: 'bottom' });
      await t.present();
    } catch (e) {
      console.error(e);
      const t = await this.toastCtrl.create({ message: 'Unable to copy invite link', duration: 1500, position: 'bottom' });
      await t.present();
    }
  }

  share(): void {
    if (!this.inviteUrl) return;
    if ((navigator as any).share) {
      (navigator as any).share({ title: 'Join my trip', text: 'Join my trip on X-Tracker', url: this.inviteUrl }).catch((e: any) => console.error(e));
    } else {
      // fallback to copy
      this.copy();
    }
  }

  revoke(): void {
    if (!this.invite) return;
    this.invites.revokeInvite(this.invite.token).subscribe({ next: () => { if (this.invite) this.invite.isActive = false; }, error: (e) => console.error(e) });
  }
}
