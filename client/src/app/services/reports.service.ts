import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilterValue } from '../models/filter.model';
export interface ReportBucket { date: string; income: number; expenses: number; transactionCount: number; }
export interface CategoryReport { category: string; amount: number; percentage: number; }
export interface ReportTransaction { id: number; title: string; amount: number; type: 'income' | 'expense'; date: string; category: string; }
export interface ReportSummary { from: string; to: string; totalIncome: number; totalExpenses: number; balance: number; expenseCount: number; averageExpense: number; dailyTotals: ReportBucket[]; weeklyTotals: ReportBucket[]; monthlyTotals: ReportBucket[]; expenseCategories: CategoryReport[]; incomeCategoryReports: CategoryReport[]; expenseCategoryReports: CategoryReport[]; transactions: ReportTransaction[]; }
@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly http: HttpClient) {}
  getSummary(filter: FilterValue): Observable<ReportSummary> {
    let params = new HttpParams().set('from', filter.dateRange.from.slice(0, 10)).set('to', filter.dateRange.to.slice(0, 10));
    if (filter.categoryId != null) params = params.set('categoryId', filter.categoryId);
    return this.http.get<ReportSummary>(`${environment.apiUrl}/Reports`, { params }).pipe(map(report => ({ ...report, incomeCategoryReports: [], expenseCategoryReports: report.expenseCategories ?? [] })));
  }
}
