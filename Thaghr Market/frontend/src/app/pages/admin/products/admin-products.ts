import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProductService }  from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product }   from '../../../core/models/product.model';
import { Category }  from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-products.html'
})
export class AdminProducts implements OnInit {
  private readonly productService  = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb              = inject(FormBuilder);

  readonly products   = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading    = signal(true);
  readonly saving     = signal(false);
  readonly showForm   = signal(false);
  readonly editId     = signal<string | null>(null);
  readonly errorMsg   = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title:       ['', [Validators.required, Validators.minLength(2)]],
    description: ['', Validators.required],
    price:       [0,  [Validators.required, Validators.min(0)]],
    category:    ['',  Validators.required],
    stock:       [0,  [Validators.required, Validators.min(0)]],
    imageUrl:    [''],
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getAll().pipe(catchError(() => of([]))).subscribe((c) => this.categories.set(c));
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll({ limit: 50 }).pipe(catchError(() => of(null))).subscribe((res) => {
      this.products.set(res?.products ?? []);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.form.reset({ price: 0, stock: 0 });
    this.editId.set(null);
    this.showForm.set(true);
    this.errorMsg.set(null);
  }

  openEdit(p: Product): void {
    this.form.patchValue({
      title:       p.title,
      description: p.description ?? '',
      price:       p.price,
      category:    typeof p.category === 'string' ? p.category : (p.category as any)._id,
      stock:       p.stock ?? 0,
      imageUrl:    p.imageUrl ?? '',
    });
    this.editId.set(p._id);
    this.showForm.set(true);
    this.errorMsg.set(null);
  }

  closeForm(): void { this.showForm.set(false); this.editId.set(null); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set(null);
    const payload = this.form.getRawValue();
    const id = this.editId();

    const req$ = id
      ? this.productService.update(id, payload)
      : this.productService.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editId.set(null);
        this.successMsg.set(id ? 'Product updated!' : 'Product created!');
        setTimeout(() => this.successMsg.set(null), 2500);
        this.loadProducts();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Failed to save product.');
      },
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p._id !== id));
        this.successMsg.set('Product deleted.');
        setTimeout(() => this.successMsg.set(null), 2000);
      },
      error: (err) => alert(err?.error?.message ?? 'Failed to delete.'),
    });
  }

  categoryName(p: Product): string {
    return typeof p.category === 'string' ? p.category : (p.category as any).name ?? '—';
  }
}
