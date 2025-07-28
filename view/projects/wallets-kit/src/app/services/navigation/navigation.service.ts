import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  readonly history: WritableSignal<string[]> = signal<string[]>([]);
  readonly lastChildRoute: WritableSignal<ActivatedRouteSnapshot | null> = signal(null);

  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
    this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationEnd) {
        this.history.update((state: string[]): string[] => ([...state, event.urlAfterRedirects]));
        this.lastChildRoute.set(this.route.snapshot.firstChild);
      }
    });
  }

  public navigateBack(): void {
    const history: string[] = this.history().slice();
    history.pop();
    if (history.length > 0) {
      this.router.navigate([history[history.length - 1] || '/']);
    } else {
      this.router.navigateByUrl("/");
    }
    history.pop();
    this.history.set(history);
  }

  public getLastUrl(): string {
    const history: string[] = this.history();
    if (history.length > 0) {
      return history[history.length - 2];
    }
    return "";
  }
}
