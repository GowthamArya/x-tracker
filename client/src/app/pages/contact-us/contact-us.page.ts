import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonHeader, IonInput, IonTextarea, IonTitle, IonToolbar]
})
export class ContactUsPage {
  name = '';
  email = '';
  subject = '';
  message = '';
  submitting = false;
  submitted = false;
  error = '';

  constructor(private readonly http: HttpClient) {}

  submit(): void {
    this.error = '';
    this.submitted = false;
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) {
      this.error = 'Please complete your name, email, and message.';
      return;
    }

    this.submitting = true;
    this.http.post<{ message: string }>(`${environment.apiUrl}/support/messages`, {
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.subject = '';
        this.message = '';
      },
      error: response => {
        this.submitting = false;
        this.error = response?.error?.message || 'We could not send your message. Please try again.';
      }
    });
  }
}
