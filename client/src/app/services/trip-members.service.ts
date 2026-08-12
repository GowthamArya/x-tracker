import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TripMember } from '../models/trip-member.model';

@Injectable({ providedIn: 'root' })
export class TripMembersService {
  private readonly apiBase = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getMembers(tripId: number): Observable<TripMember[]> {
    return this.http.get<TripMember[]>(`${this.apiBase}/trips/${tripId}/members`, { withCredentials: true });
  }

  addMember(tripId: number, userId: number) {
    return this.http.post(`${this.apiBase}/trips/${tripId}/members`, userId, { withCredentials: true });
  }
}
