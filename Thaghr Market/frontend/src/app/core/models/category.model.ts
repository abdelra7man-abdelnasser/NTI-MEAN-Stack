export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  // icon is frontend-only, derived from name
  icon?: string;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}
