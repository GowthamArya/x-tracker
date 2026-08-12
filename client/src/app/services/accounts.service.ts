import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Account } from '../models/account.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {

  private readonly apiUrl =
    environment.apiUrl + '/Accounts';

  constructor(
    private readonly http: HttpClient
  ) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      this.apiUrl
    );
  }

  getAccountById(
    id: number
  ): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiUrl}/${id}`
    );
  }

  addAccount(
    account: Account
  ): Observable<Account> {
    return this.http.post<Account>(
      this.apiUrl,
      {
        name: account.name,
        openingBalance: account.openingBalance,
      }
    );
  }

  updateAccount(
    account: Account
  ): Observable<Account> {
    return this.http.put<Account>(
      `${this.apiUrl}/${account.id}`,
      {
        name: account.name,
        openingBalance: account.openingBalance,
      }
    );
  }

  deleteAccount(
    id: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}