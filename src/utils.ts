import { AlbedoModule } from './modules/albedo/albedo.module';
import { FreighterModule } from './modules/freighter/freighter.module';
import { LobstrModule } from './modules/lobstr/lobstr.module';
import { RabetModule } from './modules/rabet/rabet.module';
import { xBullModule } from './modules/xbull/xbull.module';
import { HanaModule } from './modules/hana/hana.module';
import { ModuleInterface } from './types';
import { LedgerModule } from './modules/ledger/ledger.module';

export function allowAllModules(): ModuleInterface[] {
  return [
    new AlbedoModule(),
    new FreighterModule(),
    new RabetModule(),
    new xBullModule(),
    new LobstrModule(),
    new HanaModule(),
    new LedgerModule()
  ];
}
