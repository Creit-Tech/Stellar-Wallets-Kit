import { effect, signal } from "@preact/signals";
import type { IKitError, ISupportedWallet } from "../types/mod.ts";

export function createSubject<T>() {
  const trigger = signal<null | T>(null);
  let status: "active" | "completed" | "error" = "active";
  let storedError: unknown = null;

  const nextListeners = new Set<(v: T) => void>();
  const errorListeners = new Set<(err: unknown) => void>();
  const completeListeners = new Set<() => void>();

  // Notify listeners whenever trigger changes
  effect((): void => {
    if (status === "active" && trigger.value !== null) {
      const v = trigger.value;
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
        return () => {};
      }
      if (status === "completed") {
        complete?.();
        return () => {};
      }

      if (next) nextListeners.add(next);
      if (error) errorListeners.add(error);
      if (complete) completeListeners.add(complete);

      return () => {
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

export type ModuleSelectedEventType = ISupportedWallet | IKitError;
export const moduleSelectedEvent = createSubject<ModuleSelectedEventType>();

export const addressUpdatedEvent = createSubject<string | IKitError>();

export const closeEvent = createSubject<void>();
export const disconnectEvent = createSubject<void>();
