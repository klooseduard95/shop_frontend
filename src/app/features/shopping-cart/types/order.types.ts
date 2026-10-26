interface AddressRequest {
  country: string;
  city: string;
  county: string;
  streetAddress: string;
}

export interface OrderCreateRequest {
  userId: string;
  deliveryAddress: AddressRequest;
  products: {
    productId: string;
    quantity: number;
  }[];
}
