import { Component } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonModal, IonIcon, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, optionsOutline, refreshOutline } from 'ionicons/icons';
import { ReportsService, CategoryReport, ReportBucket, ReportSummary, ReportTransaction } from '../../services/reports.service';
import { FilterValue } from '../../models/filter.model';
import { FilterPage } from '../filters/filters.page';
import { PageRefresherComponent } from '../../components/page-refresher/page-refresher.component';
interface CalendarDay { date: string; day: number; income: number; expense: number; isToday: boolean; hasData: boolean; }
@Component({ selector: 'app-reports', templateUrl: './reports.page.html', styleUrls: ['./reports.page.scss'], imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonModal, IonIcon, DecimalPipe, FilterPage, PageRefresherComponent, IonBackButton] })
export class ReportsPage {
  filter: FilterValue | null = null; summary: ReportSummary | null = null; loading = false; error = ''; filtersOpen = false; displayedMonth = new Date(); calendarWeeks: Array<Array<CalendarDay | null>> = []; selectedDate = ''; selectedTransactions: ReportTransaction[] = [];
  constructor(private readonly reports: ReportsService) {
    addIcons({ calendarOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, optionsOutline, refreshOutline });
  }
  ionViewWillEnter(): void { if (!this.filter) { const now = new Date(), from = new Date(now.getFullYear(), now.getMonth(), 1), to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); this.filter = { preset: 'thisMonth', dateRange: { from: from.toISOString(), to: to.toISOString() }, categoryId: null, categoryType: null }; } this.load(); }
  onFilterChange(filter: FilterValue): void { this.filter = filter; this.load(); }
  openFilters(): void { this.filtersOpen = true; }
  get monthLabel(): string { return this.displayedMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }
  get categories(): CategoryReport[] { return this.summary?.expenseCategories ?? []; }
  previousMonth(): void { this.setCalendarMonth(-1); }
  nextMonth(): void { this.setCalendarMonth(1); }
  resetToCurrentMonth(): void { this.setCalendarMonth(0, true); }
  selectDay(day: CalendarDay): void { this.selectedDate = day.date; this.selectedTransactions = (this.summary?.transactions ?? []).filter(x => x.date.slice(0, 10) === day.date); }
  private load(): void {
    if (!this.filter) return;

    this.loading = true;
    this.error = '';

    this.reports.getSummary(this.filter).subscribe({
      next: (s) => {
        this.summary = s;
        this.loading = false;

        // Keep the calendar on the currently relevant month.
        // Do not use summary.from because the report range may start
        // in the previous month (e.g. week boundary).
        if (this.filter?.preset === 'thisMonth' || this.filter?.preset === 'thisWeek') {
          const now = new Date();
          this.displayedMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );
        } else {
          // For custom ranges, use the first date from the report range.
          const [year, month] = s.from.split('-').map(Number);
          this.displayedMonth = new Date(year, month - 1, 1);
        }

        this.buildCalendar();
      },

      error: () => {
        this.loading = false;
        this.error = 'We could not load reports. Please try again.';
      }
    });
  }
  private setCalendarMonth(offset: number, current = false): void {
    const base = current ? new Date() : this.displayedMonth;
    const month = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    this.filter = {
      ...(this.filter ?? { categoryId: null, categoryType: null }),
      preset: current ? 'thisMonth' : 'custom',
      dateRange: { from: this.toUtcIso(month), to: this.toUtcIso(lastDay, true) },
    };
    this.selectedDate = '';
    this.selectedTransactions = [];
    this.load();
  }
  private toUtcIso(date: Date, endOfDay = false): string {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0)).toISOString();
  }
  private buildCalendar(): void {
    const year = this.displayedMonth.getFullYear();
    const month = this.displayedMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = this.formatDate(new Date());

    const dailyTotals = this.createDailyTotalsMap();

    const days = this.createCalendarDays(
      year,
      month,
      daysInMonth,
      today,
      dailyTotals
    );

    this.calendarWeeks = this.groupIntoWeeks(
      days,
      firstDayOfMonth
    );
  }

  private createDailyTotalsMap(): Map<string, ReportBucket> {
    return new Map(
      (this.summary?.dailyTotals ?? []).map(item => [
        item.date.slice(0, 10),
        item
      ])
    );
  }

  private createCalendarDays(
    year: number,
    month: number,
    daysInMonth: number,
    today: string,
    dailyTotals: Map<string, ReportBucket>
  ): CalendarDay[] {
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      const date = [
        year,
        String(month + 1).padStart(2, '0'),
        String(day).padStart(2, '0')
      ].join('-');

      const totals = dailyTotals.get(date);

      return {
        date,
        day,
        income: totals?.income ?? 0,
        expense: totals?.expenses ?? 0,
        isToday: date === today,
        hasData: !!totals
      };
    });
  }

  private groupIntoWeeks(
    days: CalendarDay[],
    firstDayOfMonth: number
  ): Array<Array<CalendarDay | null>> {
    const weeks: Array<Array<CalendarDay | null>> = [];

    let week: Array<CalendarDay | null> = Array(firstDayOfMonth).fill(null);

    for (const day of days) {
      week.push(day);

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }

      weeks.push(week);
    }

    return weeks;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  get trend(): ReportBucket[] {
    if (!this.summary) return [];

    if (this.filter?.preset === 'thisWeek') {
      return this.summary.dailyTotals;
    }

    return this.summary.weeklyTotals.length
      ? this.summary.weeklyTotals
      : this.summary.dailyTotals;
  }

  get trendTitle(): string {
    return this.filter?.preset === 'thisWeek'
      ? 'Daily spending'
      : 'Weekly spending';
  }

  get trendDescription(): string {
    return this.filter?.preset === 'thisWeek'
      ? 'See how much you spent each day'
      : 'See how your spending is distributed across the weeks';
  }

  get maxTrend(): number {
    return Math.max(
      1,
      ...this.trend.map(item => item.expenses)
    );
  }

  formatTrendDate(date: string): string {
    const value = date.slice(0, 10);
    const [year, month, day] = value.split('-').map(Number);

    const start = new Date(year, month - 1, day);

    if (this.filter?.preset === 'thisWeek') {
      return start.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })} – ${end.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })}`;
  }

  formatAmount(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    })}`;
  }
}
