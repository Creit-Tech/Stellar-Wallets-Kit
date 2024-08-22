import { ReactiveController, ReactiveControllerHost } from 'lit';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export class ReactiveState<T> implements ReactiveController {
  sub: Subscription | null = null;
  value$: BehaviorSubject<T | undefined> = new BehaviorSubject<T | undefined>(undefined);

  constructor(private host: ReactiveControllerHost, private source: Observable<T>, public value?: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.sub = this.source.subscribe(value => {
      this.value = value;
      this.value$.next(value);
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.sub?.unsubscribe();
  }
}
