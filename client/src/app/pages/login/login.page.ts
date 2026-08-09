import { Component } from '@angular/core';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonButton,
    IonContent,
  ],
})
export class LoginPage {

  loginWithGoogle(): void {
    window.location.href =
      'https://localhost:7043/api/auth/google';
  }
}