import dotenv = require('dotenv');
dotenv.config();
import * as prayerlib from '@dpanet/prayers-lib';
import * as events from './events';
import Homey = require('homey');
import { isNullOrUndefined, debug } from 'util';

export class PrayersAppManager
{
    private static _prayerAppManger: PrayersAppManager;
    private _homeyPrayersTrigger: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>;
    public get homeyPrayersTrigger(): Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>> {
        return this._homeyPrayersTrigger;
    }
    public set homeyPrayersTrigger(value: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>) {
        this._homeyPrayersTrigger = value;
    }
    private _prayerEventProvider: prayerlib.PrayersEventProvider ///= new event.PrayersEventProvider(prayerManager);
    private _prayerEventListener: events.PrayersEventListener;


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
        
        appmanager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
        appmanager._prayerManager = await prayerlib.PrayerTimeBuilder
        .createPrayerTimeBuilder(null, appmanager._prayerConfig)
        .setPrayerMethod(prayerlib.Methods.Mecca)
        .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
        .createPrayerTimeManager();
        appmanager.initPrayersSchedules();
        appmanager.initEvents();
        console.log(appmanager._prayerManager.getUpcomingPrayer());   

        setTimeout(() => {
            appmanager.homeyPrayersTrigger.trigger({prayer_name:"Fajir",prayer_time:"Isha"},null)
            .then((result:any)=>console.log('triggered the event'+ " "+ result))
            
        }, 60000);
        }
        catch(err)
        {
            console.log(err);
        }
    }
    public initPrayersSchedules()
    {           
         this._prayerEventProvider = new prayerlib.PrayersEventProvider(appmanager._prayerManager);
         this._prayerEventListener  = new events.PrayersEventListener();
        this._prayerEventProvider.registerListener(this._prayerEventListener);
        this._prayerEventProvider.startPrayerSchedule();

    }
    public initEvents():void
    {

        this._homeyPrayersTrigger = new Homey.FlowCardTrigger('prayer_trigger_all');
        this._homeyPrayersTrigger.register();


    }


}
export var   appmanager:PrayersAppManager = PrayersAppManager.prayerAppManger;
