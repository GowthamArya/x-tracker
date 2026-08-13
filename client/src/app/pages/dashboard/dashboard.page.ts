import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons
} from '@ionic/angular/standalone';

import { addOutline, airplaneOutline, arrowUpOutline, logOutOutline } from 'ionicons/icons';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction.model';
import { CurrentUser } from '../../services/auth.service';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    DecimalPipe,
    RouterLink,
    IonButton,
    IonIcon,
    IonButtons
  ],
})
export class DashboardPage {

  transactions: Transaction[] = [];

  isLoggedIn = false;
  user: CurrentUser | null = null;

  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;
  greeting = '';
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService
  ) {
    addIcons({ addOutline, airplaneOutline, arrowUpOutline, logOutOutline });
    this.setGreeting();
  }

  ionViewWillEnter(): void {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {

    this.authService.getCurrentUser()
      .subscribe({
        next: (user) => {

          const loggedIn = user !== null;
          this.user = user;

          this.isLoggedIn = loggedIn;

          if (loggedIn) {
            this.loadDashboard();
          }

        },
        error: () => {
          this.isLoggedIn = false;
        }
      });
  }
  private setGreeting(): void {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 17) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }
  private loadDashboard(): void {
    this.dashboardService.getSummary().subscribe({
      next: summary => {
        this.transactions = summary.recent;
        this.totalIncome = summary.income;
        this.totalExpenses = summary.expenses;
        this.balance = summary.balance;
      },
      error: error => console.error('Failed to load dashboard summary', error)
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
    next: () => {
        return window.location.href = '/login';
    },
    error: error => {
        console.error('Logout failed', error);
    }
    });
  }

  get profileAvatar(): string | null {
    return this.user?.photoUrl?.trim() || null;
  }

  get profileInitial(): string {
    return (this.user?.name || this.user?.email || 'X').trim().charAt(0).toUpperCase();
  }
}
