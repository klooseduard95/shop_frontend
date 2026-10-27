import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderCreateRequest } from '../types/order.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);

  checkout(order: OrderCreateRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/orders`, order);
  }
}
