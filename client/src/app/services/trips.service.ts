import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Trip } from '../models/trip.model';
import { TripMemberBalance } from '../models/trip-member-balance.model';

export interface CreateTripRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripsService {
  private readonly apiUrl = environment.apiUrl + '/Trips';

  constructor(private readonly http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl, { withCredentials: true });
  }

  createTrip(request: CreateTripRequest) {
    return this.http.post<Trip>(this.apiUrl, request, { withCredentials: true });
  }

  getTrip(id: number) {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
    
  getBalances(tripId: number) {
    return this.http.get<TripMemberBalance[]>(`${this.apiUrl}/${tripId}/balances`, { withCredentials: true });
  }
}
