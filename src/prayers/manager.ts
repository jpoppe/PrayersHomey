import dotenv = require('dotenv');
dotenv.config();
import Debug = require('debug');
const debug = Debug("1");
import * as prayerlib from '@dpanet/prayers-lib';
import * as events from './events';
import Homey = require('homey');
import { isNullOrUndefined } from 'util';
import { start } from 'repl';

const to = require('await-to-js').default;

const athanTypes: any = { athan_short: "assets/prayers/prayer.mp3" };

export class PrayersAppManager {

    private static _prayerAppManger: PrayersAppManager;
    private _homeyPrayersTrigger: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>;
    private _homeyPrayersAthanAction: Homey.FlowCardAction<Homey.FlowCardAction<any>>;
    private _prayersRefreshEventProvider: events.PrayersRefreshEventProvider;
    private _prayersRefreshEventListener: events.PrayerRefreshEventListener;
    public get homeyPrayersTrigger(): Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>> {
        return this._homeyPrayersTrigger;
    }
    public set homeyPrayersTrigger(value: Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>>) {
        this._homeyPrayersTrigger = value;
    }
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
                .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
                .createPrayerTimeManager();
            appmanager.initPrayersSchedules();
            appmanager.initEvents();
            //  appmanager.initAthan();
            console.log(appmanager._prayerManager.getUpcomingPrayer());

            // setTimeout(() => {
            //     appmanager.homeyPrayersTrigger.trigger({prayer_name:"Fajir",prayer_time:"Isha"},null)
            //     .then((result:any)=>
            //     {
            //         console.log('triggered the event'+ " ");
            //     }
            //     )
            //     .catch((err)=> console.log(err));

            // }, 60000);
        }
        catch (err) {
            console.log(err);
        }
    }
    public initPrayersSchedules() {
        this._prayerEventProvider = new events.PrayersEventProvider(this._prayerManager);
        this._prayerEventListener = new events.PrayersEventListener(this);
        this._prayerEventProvider.registerListener(this._prayerEventListener);
        this._prayerEventProvider.startPrayerSchedule();
        this._prayersRefreshEventProvider = new events.PrayersRefreshEventProvider(this._prayerManager);


    }
    public reschedulePrayers() {
        if (!isNullOrUndefined(this._prayerEventProvider)) {
            this._prayerEventProvider.stopPrayerSchedule();

            this._prayerEventProvider.startPrayerSchedule();
        }

    }
    public scheduleRefresh() {

    }
    public initEvents(): void {
        this._homeyPrayersTrigger = new Homey.FlowCardTrigger('prayer_trigger_all');
        this._homeyPrayersAthanAction = new Homey.FlowCardAction('athan_action');
        this._homeyPrayersTrigger.register();
        this._homeyPrayersAthanAction
            .register()
            .registerRunListener((args, state) => {
                return this.playAthan(args.athan_dropdown, athanTypes[args.athan_dropdown]);
            }
            )
    }
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
    public initAthan(): void {
        Homey.ManagerAudio.playMp3('athan_short', 'assets/prayers/prayer.mp3')
            .then((result: any) => console.log('audio played'))
            .catch((err) => console.log(err));
    }

    refreshPrayerManager(): void {

        let startDate: Date = prayerlib.DateUtil.getNowDate();
        let endDate: Date = prayerlib.DateUtil.addMonth(1, startDate);
        this.prayerManager.updatePrayersDate(startDate, endDate)
            .then((value) => this.prayerEventProvider.startPrayerSchedule(this.prayerManager))
            .catch((err) => {
                console.log(err);
                this.scheduleRefresh();

            });
    }
}
export var appmanager: PrayersAppManager = PrayersAppManager.prayerAppManger;
