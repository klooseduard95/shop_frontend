import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Product, ProductRequest, SpringPage } from '../types/products.types';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/products`;

  getProducts(): Observable<Product[]> {
    return this.http.get<SpringPage<Product>>(`${this.apiUrl}`).pipe(map((page) => page.content));
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: ProductRequest) {
    return this.http.post<Product>(`${this.apiUrl}`, product);
  }

  updateProduct(id: string, product: ProductRequest) {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }
}
