export interface Product {
  id: string;
  name: string;
  price: number;
  weight: number;
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  imageUrl?: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  weight: number;
  categoryId: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
