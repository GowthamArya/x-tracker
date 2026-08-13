import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TripInvite } from '../models/trip-invite.model';

@Injectable({ providedIn: 'root' })
export class TripInvitesService {
  private readonly apiBase = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createInvite(tripId: number): Observable<TripInvite> {
    return this.http.post<TripInvite>(`${this.apiBase}/TripInvites/${tripId}`, {}, { withCredentials: true });
  }

  getInvite(token: string): Observable<TripInvite> {
    return this.http.get<TripInvite>(`${this.apiBase}/TripInvites/${token}`, { withCredentials: true });
  }

  getInviteForTrip(tripId: number): Observable<TripInvite> {
    return this.http.get<TripInvite>(`${this.apiBase}/TripInvites/trip/${tripId}`, { withCredentials: true });
  }

  joinInvite(token: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/TripInvites/${token}/join`, {}, { withCredentials: true });
  }

  revokeInvite(token: string): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/TripInvites/${token}/revoke`, {}, { withCredentials: true });
  }
}
