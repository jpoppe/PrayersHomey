import dotenv = require('dotenv');
dotenv.config();
import Debug = require('debug');
const debug = Debug("1");
import * as prayerlib from '@dpanet/prayers-lib';
import * as events from './events';
import Homey = require('homey');
import { isNullOrUndefined } from 'util';

const to = require('await-to-js').default;

const athanTypes: any = { athan_short: "assets/prayers/prayer_short.mp3", athan_full:"assets/prayers/prayer_full.mp3"  };

export class PrayersAppManager {

    private static _prayerAppManger: PrayersAppManager;
    private _homeyPrayersTriggerAll: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>;
    private _homeyPrayersTriggerSpecific: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>;
    private _homeyPrayersAthanAction: Homey.FlowCardAction<Homey.FlowCardAction<any>>;
    private _prayersRefreshEventProvider: events.PrayersRefreshEventProvider;
    private _prayersRefreshEventListener: events.PrayerRefreshEventListener;
    private _prayerEventProvider: events.PrayersEventProvider; ///= new event.PrayersEventProvider(prayerManager);
    public get prayerEventProvider(): events.PrayersEventProvider {
        return this._prayerEventProvider;
    }
    public set prayerEventProvider(value: events.PrayersEventProvider) {
        this._prayerEventProvider = value;
    }
    private _prayerEventListener: events.PrayersEventListener;

    public static get prayerAppManger(): PrayersAppManager {
        if (!isNullOrUndefined(PrayersAppManager._prayerAppManger))
            return PrayersAppManager._prayerAppManger;
        else {
        PrayersAppManager._prayerAppManger = new PrayersAppManager();
            return PrayersAppManager._prayerAppManger
        }
    }
    public static set prayerAppManger(value: PrayersAppManager) {
        PrayersAppManager._prayerAppManger = value;
    }
    private _prayerManager: prayerlib.IPrayerManager;
    public get prayerManager(): prayerlib.IPrayerManager {
        return this._prayerManager;
    }
    public set prayerManager(value: prayerlib.IPrayerManager) {
        this._prayerManager = value;
    }
    private _prayerConfig: prayerlib.IPrayersConfig;
    // private  _prayerEvents:prayerlib.
    static async initApp(): Promise<void> {
        try {
            appmanager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
            appmanager._prayerManager = await prayerlib.PrayerTimeBuilder
                .createPrayerTimeBuilder(null, appmanager._prayerConfig)
                .setPrayerMethod(prayerlib.Methods.Mecca)
                .setPrayerPeriod(prayerlib.DateUtil.getNowDate(),prayerlib.DateUtil.addDay(1,prayerlib.DateUtil.getNowDate()))
                .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
                .createPrayerTimeManager();
            appmanager.initPrayersSchedules();
            appmanager.initEvents();
            console.log(appmanager._prayerManager.getUpcomingPrayer());
        }
        catch (err) {
            console.log(err);
        }
    }
    // initallize prayer scheduling and refresh events providers and listeners
    public initPrayersSchedules() {
        this._prayerEventProvider = new events.PrayersEventProvider(this._prayerManager);
        this._prayerEventListener = new events.PrayersEventListener(this);
        this._prayerEventProvider.registerListener(this._prayerEventListener);
        this._prayerEventProvider.startPrayerSchedule();
        this._prayersRefreshEventProvider = new events.PrayersRefreshEventProvider(this._prayerManager);
        this._prayersRefreshEventListener = new events.PrayerRefreshEventListener(this);
        this._prayersRefreshEventProvider.registerListener(this._prayersRefreshEventListener);
    }

    //schedule refresh of prayers schedule based on date 
    public scheduleRefresh(date:Date) {
        this._prayersRefreshEventProvider.startPrayerRefreshSchedule(date);
    }

    //initialize Homey Events
    public initEvents(): void {
        this._homeyPrayersTriggerAll = new Homey.FlowCardTrigger('prayer_trigger_all');
        this._homeyPrayersTriggerSpecific = new Homey.FlowCardTrigger('prayer_trigger_specific');
        this._homeyPrayersAthanAction = new Homey.FlowCardAction('athan_action');
        this._homeyPrayersTriggerAll.register();
        this._homeyPrayersAthanAction
            .register()
            .registerRunListener(async(args, state) => {
              this.playAthan(args.athan_dropdown, athanTypes[args.athan_dropdown])
              .then((value)=>{ return value;})
              .catch((err)=> {
                  console.log(err);
                  return Promise.resolve(false);
              });
              
            }
            )
        this._homeyPrayersTriggerSpecific
        .register()
        .registerRunListener((args,state)=>
        {
            return  (args.athan_dropdown === state.prayer_name);
        })
    }
    
    //play athan based on trigger
    public async playAthan(sampleId: string, fileName: string): Promise<boolean> {
        console.log(sampleId);
        let err: Error, result: any;
        [err, result] = await to(Homey.ManagerAudio.playMp3(sampleId, fileName));
        if (!isNullOrUndefined(err)) {
            console.log(err);
            return Promise.resolve(false);
        }
        else
            return Promise.resolve(true);
    }
    //trigger homey event based on prayer scheduling event.
    public triggerEvent(prayerName:string, prayerTime:Date):void
    {   let timeZone:string = this._prayerManager.getPrayerTimeZone().timeZoneId;
        let prayerTimeZone:string = prayerlib.DateUtil.getDateByTimeZone(prayerTime,timeZone); 
        this._homeyPrayersTriggerAll
        .trigger({ prayer_name: prayerName, prayer_time:prayerTimeZone }, null)
        .then(() => console.log('event all run'))
        .catch((err) => {this.prayerEventProvider.stopPrayerSchedule();
            console.log(err);
        });

        this._homeyPrayersTriggerSpecific.trigger({ prayer_name: prayerName, prayer_time: prayerTimeZone }, null)
        .then(() => console.log('event specific run'))
        .catch((err) => {this.prayerEventProvider.stopPrayerSchedule();
            console.log(err);
        });
    }
    //refresh prayer manager in case we reach the end of the array.
    public refreshPrayerManager(): void {
        let startDate: Date = prayerlib.DateUtil.getNowDate();
        let endDate: Date = prayerlib.DateUtil.addMonth(1, startDate);
        this.prayerManager.updatePrayersDate(startDate, endDate)
            .then((value) =>{ this.prayerEventProvider.startPrayerSchedule(value)
           // this._prayerManager = value;
            })
            //retry every date until the prayer refresh task is done.
            .catch((err) => {
                console.log(err);
                let date:Date = prayerlib.DateUtil.addDay(1,startDate);
                this.scheduleRefresh(date);
            });
    }
}
export var appmanager: PrayersAppManager = PrayersAppManager.prayerAppManger;
