import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    DecimalPipe,
  ],
})
export class ReportsPage {
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  categoryReports: CategoryReport[] = [];

  constructor(
    private readonly reportsService: ReportsService
  ) {}

  ionViewWillEnter(): void {
    this.loadReports();
  }

  private loadReports(): void {
    this.totalIncome =
      this.reportsService.getTotalIncome();

    this.totalExpenses =
      this.reportsService.getTotalExpenses();

    this.balance =
      this.reportsService.getBalance();

    this.categoryReports =
      this.reportsService.getExpenseByCategory();
  }
}