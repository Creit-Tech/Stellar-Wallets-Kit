import { Component, computed, inject, Signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Button } from '~theme/components/button';
import { ActivatedRouteSnapshot, RouterLink } from '@angular/router';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ConfigurationService } from '../../services/configuration/configuration.service';

@Component({
  selector: 'app-header',
  imports: [
    NgIcon,
    Button,
    RouterLink
  ],
  template: `
    <header class="flex items-center px-2 py-2">
      <div class="w-3/12 flex justify-start">
        @if (showBackButton()) {
          <button (click)="navigationService.navigateBack()" app-button size="xl" class="py-1 px-2!" [ghost]="true">
            <ng-icon name="lucideArrowLeft"></ng-icon>
          </button>
        } @else {
          <button routerLink="/what-is-a-wallet" app-button size="xl" class="py-1 px-2!" [ghost]="true">
            <ng-icon name="lucideCircleHelp"></ng-icon>
          </button>
        }
      </div>
      
      <div class="w-6/12 text-center">
        <h1 class="text-(--swk-foreground-strong) font-semibold">
          {{ title() }}
        </h1>
      </div>
      
      <div class="w-3/12 flex justify-end">
        <button app-button size="xl" class="py-1 px-2!" [ghost]="true">
          <ng-icon name="lucideX"></ng-icon>
        </button>
      </div>
    </header>
  `,
  styles: ``
})
export class Header {
  navigationService: NavigationService = inject(NavigationService);
  configurationService: ConfigurationService = inject(ConfigurationService);

  title: Signal<string> = computed((): string => {
    const lastChildRoute: ActivatedRouteSnapshot | null = this.navigationService.lastChildRoute();
    if (!lastChildRoute) return this.configurationService.title();
    return lastChildRoute.data['title'] || this.configurationService.title();
  });

  showBackButton: Signal<boolean> = computed((): boolean => {
    const last: string | undefined = this.navigationService.history().slice().pop();
    return !!last && last !== '/' && last !== '/auth-options' && last !== '/dashboard';
  });
}
