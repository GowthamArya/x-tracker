import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CategoryType } from '../models/category.model';

export interface CategoryCreateRequest {
  userId?: number;
  name: string;
  type: CategoryType;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly apiUrl = environment.apiUrl + '/Categories';

  constructor(private readonly http: HttpClient) {}

  getCategories(
    userId?: number | null,
    type?: CategoryType
  ): Observable<Category[]> {
    let params = new HttpParams();

    if (userId != null) {
      params = params.set('userId', String(userId));
    }

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  createCategory(
    request: CategoryCreateRequest
  ): Observable<Category> {
    return this.http.post<Category>(
      this.apiUrl,
      request
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getCategoriesByType(type: CategoryType): Observable<Category[]> {
    return this.getCategories(undefined, type);
  }
}