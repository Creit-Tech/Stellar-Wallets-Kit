import { effect, type Signal, signal } from "@preact/signals";
import type { IKitError, ISupportedWallet } from "../types/mod.ts";

interface Subject<T> {
  next(v: T): void;

  error(err: unknown): void;

  complete(): void;

  subscribe(
    next?: (v: T) => void,
    error?: (err: unknown) => void,
    complete?: () => void,
  ): () => void;

  isCompleted(): boolean;

  hasError(): boolean;
}

export function createSubject<T>(): Subject<T> {
  const trigger: Signal<T | null> = signal<null | T>(null);
  let status: "active" | "completed" | "error" = "active";
  let storedError: unknown = null;

  const nextListeners: Set<(v: T) => void> = new Set<(v: T) => void>();
  const errorListeners: Set<(err: unknown) => void> = new Set<(err: unknown) => void>();
  const completeListeners: Set<() => void> = new Set<() => void>();

  // Notify listeners whenever trigger changes
  effect((): void => {
    if (status === "active" && trigger.value !== null) {
      const v: T | (T & undefined) = trigger.value;
      trigger.value = null; // Reset trigger so effect only fires once
      for (const cb of nextListeners) cb(v as T);
    }
  });

  function clearAll() {
    nextListeners.clear();
    errorListeners.clear();
    completeListeners.clear();
  }

  return {
    next(v: T): void {
      if (status === "active") trigger.value = v;
    },

    error(err: unknown): void {
      if (status !== "active") return;
      status = "error";
      storedError = err;
      for (const cb of errorListeners) cb(err);
      clearAll();
    },

    complete(): void {
      if (status !== "active") return;
      status = "completed";
      for (const cb of completeListeners) cb();
      clearAll();
    },

    subscribe(
      next?: (v: T) => void,
      error?: (err: unknown) => void,
      complete?: () => void,
    ) {
      if (status === "error") {
        error?.(storedError);
        return (): void => {};
      }
      if (status === "completed") {
        complete?.();
        return (): void => {};
      }

      if (next) nextListeners.add(next);
      if (error) errorListeners.add(error);
      if (complete) completeListeners.add(complete);

      return (): void => {
        if (next) nextListeners.delete(next);
        if (error) errorListeners.delete(error);
        if (complete) completeListeners.delete(complete);
      };
    },

    isCompleted(): boolean {
      return status === "completed";
    },

    hasError(): boolean {
      return status === "error";
    },
  };
}

export const moduleSelectedEvent: Subject<ISupportedWallet | IKitError> = createSubject<ISupportedWallet | IKitError>();
export const addressUpdatedEvent: Subject<string | IKitError> = createSubject<string | IKitError>();
export const closeEvent: Subject<void> = createSubject<void>();
export const disconnectEvent: Subject<void> = createSubject<void>();
