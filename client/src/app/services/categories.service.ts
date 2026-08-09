import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  userId: number;
  name: string;
  type: CategoryType;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly apiUrl =
    'https://localhost:7043/api/Categories';

  constructor(
    private readonly http: HttpClient
  ) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.apiUrl
    );
  }

  getCategoryById(
    id: number
  ): Observable<Category> {
    return this.http.get<Category>(
      `${this.apiUrl}/${id}`
    );
  }

  getCategoriesByType(
    type: CategoryType
  ): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.apiUrl}?type=${type}`
    );
  }
}