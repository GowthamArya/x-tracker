import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

import { Transaction } from '../models/transaction.model';
import { TransactionRequest } from '../models/transaction-request.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly apiUrl =
    environment.apiUrl + '/Transactions';
  private transactionsCache$: Observable<Transaction[]> | null = null;

  constructor(
    private readonly http: HttpClient
  ) {}

  getTransactions(): Observable<Transaction[]> {
    if (!this.transactionsCache$) {
      this.transactionsCache$ = this.http.get<Transaction[]>(this.apiUrl).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.transactionsCache$;
  }

  getTransactionById(
    id: number
  ): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.apiUrl}/${id}`
    );
  }

  addTransaction(
    request: TransactionRequest
  ): Observable<Transaction> {
    return this.http.post<Transaction>(
      this.apiUrl,
      request
    ).pipe(tap(() => this.invalidateCache()));
  }

  updateTransaction(
    id: number,
    request: TransactionRequest
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.apiUrl}/${id}`,
      request
    ).pipe(tap(() => this.invalidateCache()));
  }

  deleteTransaction(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    ).pipe(tap(() => this.invalidateCache()));
  }

  private invalidateCache(): void { this.transactionsCache$ = null; }
}
