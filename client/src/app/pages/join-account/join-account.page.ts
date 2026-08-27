import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, arrowForwardOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AccountInvitesService } from '../../services/account-invites.service';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-join-account', templateUrl: './join-account.page.html', styleUrls: ['./join-account.page.scss'], imports: [CommonModule, IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar] })
export class JoinAccountPage implements OnInit {
  token = '';
  invite: any = null;
  loading = true;
  joining = false;
  error = '';
  isLoggedIn = false;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly invites: AccountInvitesService, private readonly auth: AuthService) {
    addIcons({ peopleOutline, arrowForwardOutline, shieldCheckmarkOutline });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) { this.error = 'Invalid invite link.'; this.loading = false; return; }
    this.invites.get(this.token).subscribe({ next: invite => { this.invite = invite; this.loading = false; this.auth.isLoggedIn().subscribe(v => this.isLoggedIn = v); }, error: () => { this.error = 'This invite is no longer available.'; this.loading = false; } });
  }

  login(): void { window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.href)}`; }
  join(): void { this.joining = true; this.invites.join(this.token).subscribe({ next: result => this.router.navigate(['/tabs/accounts']), error: () => { this.error = 'Unable to join this account. Please try again.'; this.joining = false; } }); }
}
