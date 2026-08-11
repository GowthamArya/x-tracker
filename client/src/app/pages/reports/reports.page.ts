import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
} from '@ionic/angular/standalone';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport } from '../../services/reports.service';
import { FilterPage } from "../filters/filters.page";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    IonContent,
    DecimalPipe,
    FilterPage
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
  onFilterChange(filter: any): void {
    console.log('Filter changed:', filter);

    // Reload reports based on the selected filters
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