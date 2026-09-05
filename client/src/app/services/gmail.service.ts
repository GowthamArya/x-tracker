import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GmailImport } from '../models/gmail-import.model';

export interface GmailConnection {
  id: number;
  gmailAddress: string;
  createdAt: string;
  lastSyncedAt?: string | null;
  lastError?: string | null;
  pendingImports: number;
}

@Injectable({ providedIn: 'root' })
export class GmailService {
  private readonly apiUrl = environment.apiUrl + '/gmail';
  constructor(private readonly http: HttpClient) {}
  getConnections(): Observable<GmailConnection[]> { return this.http.get<GmailConnection[]>(`${this.apiUrl}/connections`); }
  sync(id: number): Observable<{ added: number; autoAdded: number; pending: number }> { return this.http.post<{ added: number; autoAdded: number; pending: number }>(`${this.apiUrl}/connections/${id}/sync`, {}); }
  disconnect(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/connections/${id}`); }
  getImports(): Observable<GmailImport[]> { return this.http.get<GmailImport[]>(`${this.apiUrl}/imports`); }
  confirmImport(id: number, accountId: number, categoryId: number): Observable<{ transactionId: number }> { return this.http.post<{ transactionId: number }>(`${this.apiUrl}/imports/${id}/confirm`, { accountId, categoryId }); }
  dismissImport(id: number): Observable<void> { return this.http.post<void>(`${this.apiUrl}/imports/${id}/dismiss`, {}); }
  connectUrl(): string { return `${this.apiUrl}/connect`; }
}
