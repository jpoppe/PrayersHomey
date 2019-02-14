"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const prayerlib = __importStar(require("@dpanet/prayers-lib"));
const to = require('await-to-js').default;
const util_1 = require("util");
const cron = __importStar(require("cron"));
class PrayersEventProvider extends prayerlib.EventProvider {
    constructor(prayerManager) {
        super();
        this._prayerManager = prayerManager;
    }
    registerListener(observer) {
        super.registerListener(observer);
    }
    removeListener(observer) {
        super.removeListener(observer);
    }
    notifyObservers(eventType, prayersTime, error) {
        super.notifyObservers(eventType, prayersTime, error);
    }
    startPrayerSchedule(prayerManager) {
        if (!util_1.isNullOrUndefined(prayerManager))
            this._prayerManager = prayerManager;
        if (util_1.isNullOrUndefined(this._upcomingPrayerEvent) || !this._upcomingPrayerEvent.running) {
            this.runNextPrayerSchedule();
        }
    }
    stopPrayerSchedule() {
        if (this._upcomingPrayerEvent.running)
            this._upcomingPrayerEvent.stop();
    }
    runNextPrayerSchedule() {
        let prayerTiming = this._prayerManager.getUpcomingPrayer();
        if (util_1.isNullOrUndefined(prayerTiming)) {
            this.notifyObservers(prayerlib.EventsType.OnCompleted, null);
            return;
        }
        this._upcomingPrayerEvent = new cron.CronJob(prayerTiming.prayerTime, () => {
            this.notifyObservers(prayerlib.EventsType.OnNext, prayerTiming);
        }, null, true);
        this._upcomingPrayerEvent.addCallback(() => {
            setTimeout(() => {
                this.runNextPrayerSchedule();
                //this.notifyObservers(prayerlib.EventsType.OnCompleted, null);
            }, 60000);
        });
    }
}
exports.PrayersEventProvider = PrayersEventProvider;
class PrayersEventListener {
    constructor(prayerAppManager) {
        this._prayerAppManager = prayerAppManager;
    }
    onCompleted() {
        this._prayerAppManager.prayerEventProvider.stopPrayerSchedule();
        this._prayerAppManager.refreshPrayerManager();
    }
    onError(error) {
        console.log(error);
    }
    onNext(value) {
        this._prayerAppManager.homeyPrayersTrigger.trigger({ prayer_name: value.prayerName, prayer_time: value.prayerTime.toDateString() }, null)
            .then(() => console.log('event run'))
            .catch((err) => this._prayerAppManager.prayerEventProvider.stopPrayerSchedule());
    }
}
exports.PrayersEventListener = PrayersEventListener;
class PrayersRefreshEventProvider extends prayerlib.EventProvider {
    constructor(prayerManager) {
        super();
        this._prayerManager = prayerManager;
    }
    registerListener(observer) {
        super.registerListener(observer);
    }
    removeListener(observer) {
        super.removeListener(observer);
    }
    notifyObservers(eventType, prayersTime, error) {
        super.notifyObservers(eventType, prayersTime, error);
    }
    startPrayerRefreshSchedule(date) {
        if (util_1.isNullOrUndefined(this._refreshPrayersEvent) || !this._refreshPrayersEvent.start) {
            this.runNextPrayerSchedule(date);
        }
    }
    stopPrayerRefreshSchedule() {
        if (this._refreshPrayersEvent.running)
            this._refreshPrayersEvent.stop();
    }
    runNextPrayerSchedule(date) {
        this._refreshPrayersEvent = new cron.CronJob(date, async () => {
            this.notifyObservers(prayerlib.EventsType.OnCompleted, this._prayerManager);
        }, null, true);
    }
}
exports.PrayersRefreshEventProvider = PrayersRefreshEventProvider;
class PrayerRefreshEventListener {
    constructor(prayerAppManager) {
        this._prayerAppManager = prayerAppManager;
    }
    onCompleted() {
        this._prayerAppManager.refreshPrayerManager();
    }
    onError(error) {
        console.log(error);
    }
    onNext(value) {
    }
}
exports.PrayerRefreshEventListener = PrayerRefreshEventListener;
