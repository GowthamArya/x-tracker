import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TripExpenseRequest } from '../models/trip-expense-request.model';
import { TripExpense } from '../models/trip-expense.model';

@Injectable({ providedIn: 'root' })
export class TripExpensesService {
  private readonly apiBase = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getExpenses(tripId: number): Observable<TripExpense[]> {
    return this.http.get<TripExpense[]>(`${this.apiBase}/trips/${tripId}/expenses`, { withCredentials: true });
  }

  getExpense(tripId: number, id: number) {
    return this.http.get<TripExpense>(`${this.apiBase}/trips/${tripId}/expenses/${id}`, { withCredentials: true });
  }

  addExpense(tripId: number, request: TripExpenseRequest) {
    return this.http.post<TripExpense>(`${this.apiBase}/trips/${tripId}/expenses`, request, { withCredentials: true });
  }

  updateExpense(tripId: number, id: number, request: TripExpenseRequest) {
    return this.http.put<TripExpense>(`${this.apiBase}/trips/${tripId}/expenses/${id}`, request, { withCredentials: true });
  }

  deleteExpense(tripId: number, id: number) {
    return this.http.delete(`${this.apiBase}/trips/${tripId}/expenses/${id}`, { withCredentials: true });
  }
}
