import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';

const CHROMELESS_ROUTES = ['/login'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    @if (showChrome()) {
      <app-navbar></app-navbar>
    }
    <router-outlet></router-outlet>
    @if (showChrome()) {
      <app-footer></app-footer>
    }
  `
})
export class App {
  readonly showChrome = signal(true);

  constructor(router: Router) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects.split('?')[0];
      this.showChrome.set(!CHROMELESS_ROUTES.includes(url));
    });
  }
}
