import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport, ReportSummary } from '../../services/reports.service';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
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
    this.reportsService.getSummary(this.filter).subscribe({
      next: (summary: ReportSummary) => {
        this.totalIncome = summary.totalIncome;
        this.totalExpenses = summary.totalExpenses;
        this.balance = summary.balance;
        this.incomeCategoryReports = summary.incomeCategoryReports;
        this.expenseCategoryReports = summary.expenseCategoryReports;
      },
      error: (error) => console.error('Failed to load report summary', error)
    });
  }
}
