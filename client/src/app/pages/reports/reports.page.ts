import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
} from '@ionic/angular/standalone';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport } from '../../services/reports.service';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    IonContent,
    DecimalPipe,
    FilterPage,
  ],
})
export class ReportsPage {
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  incomeCategoryReports: CategoryReport[] = [];
  expenseCategoryReports: CategoryReport[] = [];

  private filter: FilterValue | null = null;

  constructor(
    private readonly reportsService: ReportsService
  ) {}

  ionViewWillEnter(): void {
    this.loadReports();
  }

  onFilterChange(filter: FilterValue): void {
    this.filter = filter;
    this.loadReports();
  }

  private loadReports(): void {
    this.reportsService
      .getTotalIncome(this.filter)
      .subscribe({
        next: (total) => {
          this.totalIncome = total;
        },
        error: (error) => {
          console.error('Failed to load total income', error);
        },
      });

    this.reportsService
      .getTotalExpenses(this.filter)
      .subscribe({
        next: (total) => {
          this.totalExpenses = total;
        },
        error: (error) => {
          console.error('Failed to load total expenses', error);
        },
      });

    this.reportsService
      .getBalance(this.filter, this.filter)
      .subscribe({
        next: (balance) => {
          this.balance = balance;
        },
        error: (error) => {
          console.error('Failed to load balance', error);
        },
      });

    this.reportsService
      .getIncomeByCategory(this.filter)
      .subscribe({
        next: (reports) => {
          this.incomeCategoryReports = reports;
        },
        error: (error) => {
          console.error('Failed to load income category reports', error);
        },
      });

    this.reportsService
      .getExpenseByCategory(this.filter)
      .subscribe({
        next: (reports) => {
          this.expenseCategoryReports = reports;
        },
        error: (error) => {
          console.error('Failed to load expense category reports', error);
        },
      });
  }
}
