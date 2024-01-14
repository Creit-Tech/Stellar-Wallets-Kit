import { AlbedoModule } from './modules/albedo/albedo.module';
import { FreighterModule } from './modules/freighter/freighter.module';
import { RabetModule } from './modules/rabet/rabet.module';
import { xBullModule } from './modules/xbull/xbull.module';
import { ModuleInterface } from './types';

export function allowAllModules(): ModuleInterface[] {
  return [new AlbedoModule(), new FreighterModule(), new RabetModule(), new xBullModule()];
}
