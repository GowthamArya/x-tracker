import { Component, DOCUMENT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, checkmarkCircleOutline, logoGoogle, shieldCheckmarkOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.page.html',
  styleUrls: ['./public-home.page.scss'],
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar, RouterLink],
})
export class PublicHomePage {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    addIcons({ arrowForwardOutline, checkmarkCircleOutline, logoGoogle, shieldCheckmarkOutline, walletOutline });
    this.configureSeo();
  }

  private configureSeo(): void {
    const pageTitle = 'X-Tracker | Personal and shared expense tracking';
    const description = 'Track everyday spending, shared accounts, and trip expenses in one clear view with X-Tracker.';
    const canonicalUrl = 'https://x-tracker.runasp.net/';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }
}
