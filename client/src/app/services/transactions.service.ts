import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Transaction } from '../models/transaction.model';
import { TransactionRequest } from '../models/transaction-request.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly apiUrl =
    'https://localhost:7043/api/Transactions';

  constructor(
    private readonly http: HttpClient
  ) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      this.apiUrl
    );
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
    );
  }

  updateTransaction(
    id: number,
    request: TransactionRequest
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteTransaction(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}