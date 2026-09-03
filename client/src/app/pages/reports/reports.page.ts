import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonModal,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, optionsOutline, refreshOutline } from 'ionicons/icons';

import { ReportsService } from '../../services/reports.service';
import { CategoryReport, ReportSummary } from '../../services/reports.service';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';
import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';

interface CalendarDay {
  date: string;
  day: number;
  income: number;
  expense: number;
  net: number;
  isToday: boolean;
  hasData: boolean;
  total: number;
}

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
    IonModal,
    IonIcon,
    DecimalPipe,
    FilterPage,
    PageRefresherComponent,
  ],
})
export class ReportsPage {
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  incomeCategoryReports: CategoryReport[] = [];
  expenseCategoryReports: CategoryReport[] = [];

  filter: FilterValue | null = null;
  filtersOpen = false;
  displayedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  calendarWeeks: Array<Array<CalendarDay | null>> = [];
  highestDay: CalendarDay | null = null;
  lowestDay: CalendarDay | null = null;
  private touchStartX: number | null = null;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly transactionsService: TransactionsService
  ) {
    addIcons({ calendarOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, optionsOutline, refreshOutline });
  }

  ionViewWillEnter(): void {
    this.loadReports();
    this.loadCalendar();
  }

  onFilterChange(filter: FilterValue): void {
    this.filter = filter;
    this.loadReports();
  }

  openFilters(): void { this.filtersOpen = true; }

  get monthLabel(): string {
    return this.displayedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    this.displayedMonth = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth() - 1, 1);
    this.buildCalendar(this.lastTransactions);
  }

  nextMonth(): void {
    this.displayedMonth = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth() + 1, 1);
    this.buildCalendar(this.lastTransactions);
  }

  resetToCurrentMonth(): void {
    const now = new Date();
    this.displayedMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.buildCalendar(this.lastTransactions);
  }

  onCalendarTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.screenX ?? null;
  }

  onCalendarTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const distance = (event.changedTouches[0]?.screenX ?? this.touchStartX) - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(distance) < 55) return;
    distance < 0 ? this.nextMonth() : this.previousMonth();
  }

  private lastTransactions: Transaction[] = [];

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

  private loadCalendar(): void {
    this.transactionsService.getTransactions().subscribe({
      next: transactions => {
        this.lastTransactions = transactions;
        this.buildCalendar(transactions);
      },
      error: error => console.error('Failed to load calendar transactions', error)
    });
  }

  private buildCalendar(transactions: Transaction[]): void {
    const year = this.displayedMonth.getFullYear();
    const month = this.displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = this.toDateKey(new Date());
    const totals = new Map<string, { income: number; expense: number }>();

    for (const transaction of transactions) {
      const date = this.toDateKey(transaction.transactionDate);
      const current = totals.get(date) ?? { income: 0, expense: 0 };
      if (transaction.type === 'income') current.income += transaction.amount;
      else current.expense += transaction.amount;
      totals.set(date, current);
    }

    const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const total = totals.get(date) ?? { income: 0, expense: 0 };
      return { date, day, income: total.income, expense: total.expense, net: total.income - total.expense, isToday: date === today, hasData: total.income > 0 || total.expense > 0, total: total.income + total.expense };
    });

    this.calendarWeeks = [];
    let week: Array<CalendarDay | null> = Array(firstDay).fill(null);
    for (const day of days) {
      week.push(day);
      if (week.length === 7) { this.calendarWeeks.push(week); week = []; }
    }
    if (week.length) { while (week.length < 7) week.push(null); this.calendarWeeks.push(week); }

    const withData = days.filter(day => day.hasData);
    this.highestDay = withData.length ? [...withData].sort((a, b) => b.total - a.total)[0] : null;
    this.lowestDay = withData.length ? [...withData].sort((a, b) => a.total - b.total)[0] : null;
  }

  private toDateKey(value: string | Date): string {
    if (typeof value === 'string') return value.slice(0, 10);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}
