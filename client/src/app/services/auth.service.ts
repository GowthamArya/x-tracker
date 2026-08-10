import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;
  private currentUser: CurrentUser | null = null;

  constructor(
    private readonly http: HttpClient
  ) {}

  getCurrentUser(): Observable<CurrentUser | null> {
    return this.http
      .get<CurrentUser>(`${this.apiUrl}/auth/me`, {
        withCredentials: true
      })
      .pipe(
        tap(user => {
          this.currentUser = user;
        }),
        catchError(() => {
          this.currentUser = null;
          return of(null);
        })
      );
  }

  isLoggedIn(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user !== null)
    );
  }

  getUser(): CurrentUser | null {
    return this.currentUser;
  }

  logout(): Observable<void> {
    
    return this.http
      .post<void>(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          withCredentials: true
        }
      )
      .pipe(
        tap(() => {
          this.currentUser = null;
        })
      );
  }
}