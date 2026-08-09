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

    this.router.navigate(['/tabs/dashboard']);
  }
}