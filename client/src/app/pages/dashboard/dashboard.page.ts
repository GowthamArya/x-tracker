import { Component, OnInit } from '@angular/core';
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
export class DashboardPage implements OnInit {
  transactions: Transaction[] = [];
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  constructor(
    private readonly dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.transactions = this.dashboardService.getRecentTransactions();
    this.totalIncome = this.dashboardService.getTotalIncome();
    this.totalExpenses = this.dashboardService.getTotalExpenses();
    this.balance = this.dashboardService.getBalance();
  }
}