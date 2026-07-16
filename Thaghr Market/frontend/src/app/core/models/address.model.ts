export interface Address {
  _id?: string;
  user?: string;
  street: string;      // backend field names
  city: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}
