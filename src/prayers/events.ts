import dotenv = require('dotenv');
dotenv.config();
import * as prayerlib from '@dpanet/prayers-lib';
import * as manager from './manager';
const to = require('await-to-js').default;
import { isNullOrUndefined } from 'util';
import * as cron from 'cron';
export class PrayersEventListener implements prayerlib.IObserver<prayerlib.IPrayersTiming>
{
    constructor()
    {
    }
    onCompleted(): void {
        throw new Error("Method not implemented.");
    }
    onError(error: Error): void {
        console.log(error);
    }
    onNext(value: prayerlib.IPrayersTiming): void {
        try {
            manager.appmanager.homeyPrayersTrigger.trigger({prayer_name:value.prayerName,prayer_time:value.prayerTime.toDateString()},null)
            .then(()=>console.log('event run'));

        } catch (err) {
            console.log(err);
        }
    }
}

export class PrayersRefreshEventProvider extends prayerlib.EventProvider<prayerlib.IPrayerManager>
{
    private _prayerManager: prayerlib.IPrayerManager;
    private _refreshPrayersEvent: cron.CronJob;
    constructor(prayerManager: prayerlib.IPrayerManager) {
        super();
        this._prayerManager = prayerManager;
    }
    public registerListener(observer: prayerlib.IObserver<prayerlib.IPrayerManager>): void {
        super.registerListener(observer);
    }
    public removeListener(observer: prayerlib.IObserver<prayerlib.IPrayerManager>): void {
        super.removeListener(observer);
    }
    public notifyObservers(prayersTime: prayerlib.IPrayerManager,error?:Error): void {
        super.notifyObservers(prayersTime,error);
    }
    public startPrayerSchedule(): void 
    {
        if (isNullOrUndefined(this._refreshPrayersEvent) || !this._refreshPrayersEvent.start) {
            this.runNextPrayerSchedule();
        }
    }
    public stopPrayerSchedule(): void {
        if (this._refreshPrayersEvent.running)
            this._refreshPrayersEvent.stop();
    }
    private  runNextPrayerSchedule(): void {
        this._refreshPrayersEvent = new cron.CronJob(prayerlib.DateUtil.addDay(-1,this._prayerManager.getPrayerEndPeriond()), async () => { 
          this.scheduleRefresh().then().catch((err)=> {return console.log(err)}) },
            null, true);
        this._refreshPrayersEvent.addCallback(() => { setTimeout(() => this.runNextPrayerSchedule(), 3000); });
    }
    private async scheduleRefresh():Promise<void>
    {
        let startDate:Date = this._prayerManager.getPrayerStartPeriod();
        let endDate:Date = this._prayerManager.getPrayerEndPeriond();
        startDate = prayerlib.DateUtil.addDay(1,startDate);
        endDate = prayerlib.DateUtil.addMonth(1,endDate);
        try{
           this._prayerManager =  await this._prayerManager.updatePrayersDate(startDate,endDate);
           this.notifyObservers(this._prayerManager);
        }
        catch(err)
        {
            this.notifyObservers(null,err);
        }
    }
}

export class PrayerRefreshEventListener implements prayerlib.IObserver<prayerlib.IPrayerManager>
{
    constructor()
    {
    }
    onCompleted(): void {
    }
    onError(error: Error): void {
    }
    onNext(value: prayerlib.IPrayerManager): void {
        manager.appmanager.prayerManager = value;
        manager.appmanager.reschedulePrayers();
 
    }
}
