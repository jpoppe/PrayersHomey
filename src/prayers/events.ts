import dotenv = require('dotenv');
dotenv.config();
import * as prayerlib from '@dpanet/prayers-lib';
import * as manager from './manager';
const to = require('await-to-js').default;
import { isNullOrUndefined } from 'util';
import * as cron from 'cron';
import { DateUtil } from '@dpanet/prayers-lib';

export class PrayersEventProvider extends prayerlib.EventProvider<prayerlib.IPrayersTiming>
{
    private _prayerManager: prayerlib.IPrayerManager;
    private _upcomingPrayerEvent: cron.CronJob;
    constructor(prayerManager: prayerlib.IPrayerManager) {
        super();
        this._prayerManager = prayerManager;
    }
    public registerListener(observer: prayerlib.IObserver<prayerlib.IPrayersTiming>): void {
        super.registerListener(observer);
    }
    public removeListener(observer: prayerlib.IObserver<prayerlib.IPrayersTiming>): void {
        super.removeListener(observer);
    }
    public notifyObservers(eventType: prayerlib.EventsType, prayersTime: prayerlib.IPrayersTiming, error?: Error): void {
        super.notifyObservers(eventType, prayersTime, error);
    }
    public startPrayerSchedule(prayerManager?: prayerlib.IPrayerManager): void {
        if (!isNullOrUndefined(prayerManager))
            this._prayerManager = prayerManager;
        if (isNullOrUndefined(this._upcomingPrayerEvent) || !this._upcomingPrayerEvent.running) {
            this.runNextPrayerSchedule();
        }
    }
    public stopPrayerSchedule(): void {
        if (this._upcomingPrayerEvent.running)
            this._upcomingPrayerEvent.stop();
    }
    private runNextPrayerSchedule(): void {
        let prayerTiming: prayerlib.IPrayersTiming = this._prayerManager.getUpcomingPrayer();
        if(isNullOrUndefined(prayerTiming))
        {
        this.notifyObservers(prayerlib.EventsType.OnCompleted, null);
        return;
        }
        this._upcomingPrayerEvent = new cron.CronJob(prayerTiming.prayerTime, () => {
            this.notifyObservers(prayerlib.EventsType.OnNext, prayerTiming)
        },
            null, true);
        this._upcomingPrayerEvent.addCallback(() => {
            setTimeout(() => {
                this.runNextPrayerSchedule()
                //this.notifyObservers(prayerlib.EventsType.OnCompleted, null);
            }, 60000);
        });
    }
}
export class PrayersEventListener implements prayerlib.IObserver<prayerlib.IPrayersTiming>
{
    private _prayerAppManager: manager.PrayersAppManager
    constructor(prayerAppManager: manager.PrayersAppManager) {
        this._prayerAppManager = prayerAppManager;
    }
    onCompleted(): void {
        this._prayerAppManager.prayerEventProvider.stopPrayerSchedule();
        this._prayerAppManager.refreshPrayerManager();
    }
    onError(error: Error): void {
        console.log(error);
    }
    onNext(value: prayerlib.IPrayersTiming): void {
        this._prayerAppManager.homeyPrayersTrigger.trigger({ prayer_name: value.prayerName, prayer_time: value.prayerTime.toDateString() }, null)
            .then(() => console.log('event run'))
            .catch((err) => this._prayerAppManager.prayerEventProvider.stopPrayerSchedule());
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
    public notifyObservers(eventType: prayerlib.EventsType, prayersTime: prayerlib.IPrayerManager, error?: Error): void {
        super.notifyObservers(eventType, prayersTime, error);
    }
    public startPrayerRefreshSchedule(date: Date): void {
        if (isNullOrUndefined(this._refreshPrayersEvent) || !this._refreshPrayersEvent.start) {
            this.runNextPrayerSchedule(date);
        }
    }
    public stopPrayerRefreshSchedule(): void {
        if (this._refreshPrayersEvent.running)
            this._refreshPrayersEvent.stop();
    }
    private runNextPrayerSchedule(date: Date): void {
        this._refreshPrayersEvent = new cron.CronJob(date, async () => {
            this.notifyObservers(prayerlib.EventsType.OnCompleted,this._prayerManager);
        },
            null, true);         
    }

}
export class PrayerRefreshEventListener implements prayerlib.IObserver<prayerlib.IPrayerManager>
{
    private _prayerAppManager: manager.PrayersAppManager
    constructor(prayerAppManager: manager.PrayersAppManager) {
        this._prayerAppManager = prayerAppManager;
    }
    onCompleted(): void {
        this._prayerAppManager.refreshPrayerManager();
    }
    onError(error: Error): void {
        console.log(error);
    }
    onNext(value: prayerlib.IPrayerManager): void {
    }
}
