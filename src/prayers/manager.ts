import dotenv = require('dotenv');
dotenv.config();
import * as prayerlib from '@dpanet/prayers-lib';
import Homey = require('homey');
import { isNullOrUndefined, debug } from 'util';
export class PrayersAppManager
{
    private static _prayerAppManger: PrayersAppManager;
    public static get prayerAppManger(): PrayersAppManager {
        if(!isNullOrUndefined(PrayersAppManager._prayerAppManger))
        return PrayersAppManager._prayerAppManger;
        else 
        {PrayersAppManager._prayerAppManger = new PrayersAppManager();
            return  PrayersAppManager._prayerAppManger
        }
    }
    public static set prayerAppManger(value: PrayersAppManager) {
        PrayersAppManager._prayerAppManger = value;
    }
    private  _prayerManager:prayerlib.IPrayerManager;
    private  _prayerConfig:prayerlib.IPrayersConfig;
   // private  _prayerEvents:prayerlib.
    static async initApp():Promise<void>
    {
        let manager:PrayersAppManager = PrayersAppManager.prayerAppManger;
     //  manager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
        manager._prayerManager = await prayerlib.PrayerTimeBuilder
        .createPrayerTimeBuilder(null, null)
        .setPrayerMethod(prayerlib.Methods.Mecca)
        .setPrayerPeriod(new Date('2019-02-10'), new Date('2019-02-28'))
        .setLocationByCoordinates(24.4942437, 54.4068603)
        .createPrayerTimeManager();
        
        console.log(manager._prayerManager.getUpcomingPrayer());   
    }


}