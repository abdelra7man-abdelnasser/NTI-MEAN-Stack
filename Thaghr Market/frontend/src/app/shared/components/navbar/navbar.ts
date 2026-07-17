import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService }     from '../../../core/services/auth.service';
import { CartService }     from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category }        from '../../../core/models/category.model';
import { catchError, of }  from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit {
  private readonly auth            = inject(AuthService);
  private readonly cart            = inject(CartService);
  private readonly router          = inject(Router);
  private readonly categoryService = inject(CategoryService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser     = this.auth.currentUser;
  readonly cartCount       = this.cart.itemCount;
  readonly mobileMenuOpen  = signal(false);
  readonly catMenuOpen     = signal(false);
  readonly categories      = signal<Category[]>([]);

  ngOnInit(): void {
    this.categoryService
      .getAll()
      .pipe(catchError(() => of([] as Category[])))
      .subscribe((cats) => this.categories.set(cats));
  }

  toggleMobileMenu(): void { this.mobileMenuOpen.update((o) => !o); }
  closeMobileMenu(): void  { this.mobileMenuOpen.set(false); }
  toggleCatMenu(): void    { this.catMenuOpen.update((o) => !o); }
  closeCatMenu(): void     { this.catMenuOpen.set(false); }

  onSearch(term: string): void {
    if (term.trim()) {
      this.router.navigate(['/'], { queryParams: { search: term.trim() } });
      this.closeMobileMenu();
    }
  }

  filterByCategory(id: string): void {
    this.router.navigate(['/'], { queryParams: { category: id } });
    this.closeCatMenu();
    this.closeMobileMenu();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
