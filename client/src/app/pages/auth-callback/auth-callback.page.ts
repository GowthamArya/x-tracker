import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.page.html',
  styleUrls: ['./auth-callback.page.scss'],
  imports: [
    IonContent,
    IonSpinner,
  ],
})
export class AuthCallbackPage implements OnInit {

  constructor(
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const token =
      new URLSearchParams(
        window.location.search
      ).get('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    localStorage.setItem(
      'xtracker_token',
      token
    );

    const returnUrl = localStorage.getItem('xtracker_return_url');
    localStorage.removeItem('xtracker_return_url');
    if (returnUrl) {
      try {
        const target = new URL(returnUrl, window.location.origin);
        this.router.navigateByUrl(`${target.pathname}${target.search}${target.hash}`);
        return;
      } catch {
        // Fall back to the dashboard if a stale or malformed return URL is present.
      }
    }
    this.router.navigate(['/tabs/dashboard']);
  }
}
