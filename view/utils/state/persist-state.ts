import { patchState, signalState, SignalState, watchState } from "@ngrx/signals";
import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

export type PersistedStateOpts<T> = {
  /**
   * This key is the one it will be used with this state in the localstorage
   */
  key: string;

  /**
   * This value should be set to true if we don't want to listen to other windows updates to the state
   */
  ignoreStorageUpdates?: boolean;

  /**
   * Useful when we don't want to keep on the storage some values.
   */
  skipValues?: Array<keyof T>;
};

export type PersistedState<T extends object> = {
  state: SignalState<T>;
  stopUpdatingStorage: () => void;
  reset: () => void;
};

export function persistedState<T extends object>(data: T, opts: PersistedStateOpts<T>): PersistedState<T> {
  const platform: object = inject(PLATFORM_ID);

  let initialState: T = { ...data };

  const savedState: string | null = isPlatformBrowser(platform)
    ? window.localStorage.getItem(opts.key)
    : null;

  if (savedState) {
    initialState = {
      ...initialState,
      ...JSON.parse(savedState)
    };
  }

  const state: SignalState<T> = signalState<T>(initialState);

  // TODO: listen to updates from the storage in other windows.

  const { destroy } = watchState(state, (updatedState: T): void => {
    const toSave: T = { ...updatedState };
    if (opts.skipValues) {
      for (const skipValue of opts.skipValues) {
        delete toSave[skipValue];
      }
    }

    if (isPlatformBrowser(platform)) {
      window.localStorage.setItem(opts.key, JSON.stringify(toSave));
    }
  });

  return {
    state,
    stopUpdatingStorage(): void {
      destroy();
    },
    reset(): void {
      patchState(state, data);
    }
  };
}
