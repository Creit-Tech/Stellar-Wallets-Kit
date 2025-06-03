import { AlbedoModule } from './modules/albedo.module';
import { FreighterModule } from './modules/freighter.module';
import { LobstrModule } from './modules/lobstr.module';
import { RabetModule } from './modules/rabet.module';
import { xBullModule } from './modules/xbull.module';
import { HotWalletModule } from './modules/hotwallet.module';
import { HanaModule } from './modules/hana.module';
import { ModuleInterface } from './types';

/**
 * This method returns all modules that don't require extra configuration before they can be loaded
 * You can provide a filter function if needed
 */
export function allowAllModules(opts?: { filterBy: (module: ModuleInterface) => boolean }): ModuleInterface[] {
  const modules: ModuleInterface[] = [
    new AlbedoModule(),
    new FreighterModule(),
    new RabetModule(),
    new xBullModule(),
    new LobstrModule(),
    new HanaModule(),
    new HotWalletModule(),
  ];
  return opts?.filterBy ? modules.filter(opts.filterBy) : modules;
}

/**
 * This method only returns those modules from wallet that follow exactly the SEP-43 standard and don't require extra configuration before they can be loaded
 * You can provide a filter function if needed
 */
export function sep43Modules(opts?: { filterBy: (module: ModuleInterface) => boolean }): ModuleInterface[] {
  const modules: ModuleInterface[] = [new FreighterModule(), new HotWalletModule()];
  return opts?.filterBy ? modules.filter(opts.filterBy) : modules;
}

export function parseError(e: any) {
  return {
    code: e?.error?.code || e?.code || -1,
    message: e?.error?.message || e?.message || (typeof e === 'string' && e) || 'Unhandled error from the wallet',
    ext: e?.error?.ext || e?.ext,
  };
}
