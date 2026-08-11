import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
} from '@ionic/angular/standalone';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport } from '../../services/reports.service';
import { Filter.page } from '../filters/filters.page';
import { Filterpage } from '../filters/filters.page.spec';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    IonContent,
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
    this.reportsService
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

    this.reportsService
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

    this.reportsService
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

    this.reportsService
      .getExpenseByCategory()
      .subscribe({
        next: (reports) => {
          this.categoryReports = reports;
        },
        error: (error) => {
          console.error(
            'Failed to load expense reports',
            error
          );
        },
      });
  }
}