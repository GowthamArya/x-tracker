import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton
} from '@ionic/angular/standalone';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    DecimalPipe,
    RouterLink,
    IonButton
  ],
})
export class DashboardPage {

  transactions: Transaction[] = [];

  isLoggedIn = false;

  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService
  ) {}

  ionViewWillEnter(): void {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {

    this.authService.isLoggedIn()
      .subscribe({
        next: (loggedIn) => {

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

  private loadDashboard(): void {

    this.dashboardService
      .getRecentTransactions()
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
        },
        error: (error) => {
          console.error(
            'Failed to load recent transactions',
            error
          );
        },
      });

    this.dashboardService
      .getTotalIncome()
      .subscribe({
        next: (total) => {
          this.totalIncome = total;
        },
        error: (error) => {
          console.error(
            'Failed to load total income',
            error
          );
        },
      });

    this.dashboardService
      .getTotalExpenses()
      .subscribe({
        next: (total) => {
          this.totalExpenses = total;
        },
        error: (error) => {
          console.error(
            'Failed to load total expenses',
            error
          );
        },
      });

    this.dashboardService
      .getBalance()
      .subscribe({
        next: (balance) => {
          this.balance = balance;
        },
        error: (error) => {
          console.error(
            'Failed to load balance',
            error
          );
        },
      });
  }

  logout(): void {
    console.log('Logging out...', window.location.href);
    this.authService.logout().subscribe({
    next: () => {
        console.log('Logout successful');
        return window.location.href = '/login';
    },
    error: error => {
        console.error('Logout failed', error);
    }
    });
  }
}