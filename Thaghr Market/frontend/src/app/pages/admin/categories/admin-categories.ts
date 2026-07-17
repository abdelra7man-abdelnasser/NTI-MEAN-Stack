import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-categories.html'
})
export class AdminCategories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb              = inject(FormBuilder);

  readonly categories = signal<Category[]>([]);
  readonly loading    = signal(true);
  readonly saving     = signal(false);
  readonly showForm   = signal(false);
  readonly editId     = signal<string | null>(null);
  readonly errorMsg   = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: [''],
    imageUrl:    [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.categoryService.getAll().pipe(catchError(() => of([]))).subscribe((cats) => {
      this.categories.set(cats);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.form.reset();
    this.editId.set(null);
    this.showForm.set(true);
    this.errorMsg.set(null);
  }

  openEdit(c: Category): void {
    this.form.patchValue({ name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '' });
    this.editId.set(c._id);
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

    const req$ = id ? this.categoryService.update(id, payload) : this.categoryService.create(payload);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editId.set(null);
        this.successMsg.set(id ? 'Category updated!' : 'Category created!');
        setTimeout(() => this.successMsg.set(null), 2500);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Failed to save category.');
      },
    });
  }

  delete(id: string, name: string): void {
    if (!confirm(`Delete "${name}"? Products in this category will lose their category.`)) return;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c._id !== id));
        this.successMsg.set('Category deleted.');
        setTimeout(() => this.successMsg.set(null), 2000);
      },
      error: (err) => alert(err?.error?.message ?? 'Failed to delete.'),
    });
  }
}
