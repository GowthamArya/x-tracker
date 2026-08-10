import { Component } from '@angular/core';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';

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
      environment.apiUrl + '/auth/google';
  }
}