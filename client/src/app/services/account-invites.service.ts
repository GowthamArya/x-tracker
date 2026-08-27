import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccountInvite } from '../models/account-invite.model';

@Injectable({ providedIn: 'root' })
export class AccountInvitesService {
  private readonly apiBase = environment.apiUrl;
  constructor(private readonly http: HttpClient) {}
  getForAccount(accountId: number): Observable<AccountInvite> { return this.http.get<AccountInvite>(`${this.apiBase}/AccountInvites/account/${accountId}`); }
  create(accountId: number): Observable<AccountInvite> { return this.http.post<AccountInvite>(`${this.apiBase}/AccountInvites/account/${accountId}`, {}); }
  get(token: string): Observable<AccountInvite> { return this.http.get<AccountInvite>(`${this.apiBase}/AccountInvites/${token}`); }
  join(token: string): Observable<{ accountId: number }> { return this.http.post<{ accountId: number }>(`${this.apiBase}/AccountInvites/${token}/join`, {}); }
}
