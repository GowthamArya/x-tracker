import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { DashboardService } from '../../services/dashboard.service';
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
  ],
})
export class DashboardPage {
  transactions: Transaction[] = [];

  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  ionViewWillEnter(): void {
    this.loadDashboard();
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
}