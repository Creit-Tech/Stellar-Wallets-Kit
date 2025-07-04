import { AlbedoModule } from "./modules/albedo.module.ts";
import { FreighterModule } from "./modules/freighter.module.ts";
import { LobstrModule } from "./modules/lobstr.module.ts";
import { RabetModule } from "./modules/rabet.module.ts";
import { xBullModule } from "./modules/xbull.module.ts";
import { HanaModule } from "./modules/hana.module.ts";
import type { IKitError, ModuleInterface } from "./types.ts";

/**
 * This method returns all modules that don't require extra configuration before they can be loaded
 * You can provide a filter function if needed
 *
 * Note: If you are the creator of a module and you want the module to be listed here, the module must not require any extra configuration nor polyfills (everything should be include already in your module's dependencies).
 * If your module requires some extra polyfill or configuration then the user of the kit needs to include it manually.
 */
export function defaultModules(opts?: { filterBy: (module: ModuleInterface) => boolean }): ModuleInterface[] {
  const modules: ModuleInterface[] = [
    new AlbedoModule(),
    new FreighterModule(),
    new RabetModule(),
    new xBullModule(),
    new LobstrModule(),
    new HanaModule(),
  ];
  return opts?.filterBy ? modules.filter(opts.filterBy) : modules;
}

/**
 * This method only returns those modules from wallet that follow exactly the SEP-43 standard and don't require extra configuration before they can be loaded
 * You can provide a filter function if needed
 *
 * Note: If you are the creator of a module and you want the module to be listed here, the module must not require any extra configuration nor polyfills (everything should be included already in your module's dependencies).
 * If your module requires some extra polyfill or configuration then the user of the kit needs to include it manually.
 */
export function sep43Modules(opts?: { filterBy: (module: ModuleInterface) => boolean }): ModuleInterface[] {
  const modules: ModuleInterface[] = [new FreighterModule()];
  return opts?.filterBy ? modules.filter(opts.filterBy) : modules;
}

export function parseError(e: any): IKitError {
  return {
    code: e?.error?.code || e?.code || -1,
    message: e?.error?.message || e?.message || (typeof e === "string" && e) || "Unhandled error from the wallet",
    ext: e?.error?.ext || e?.ext,
  };
}
