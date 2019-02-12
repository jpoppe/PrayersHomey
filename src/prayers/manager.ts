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
        try{
        let manager:PrayersAppManager = PrayersAppManager.prayerAppManger;
         manager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
        manager._prayerManager = await prayerlib.PrayerTimeBuilder
        .createPrayerTimeBuilder(null, manager._prayerConfig)
        .setPrayerMethod(prayerlib.Methods.Mecca)
        .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
        .createPrayerTimeManager();
        
        console.log(manager._prayerManager.getUpcomingPrayer());   
        }
        catch(err)
        {
            console.log(err);
        }
    }


}