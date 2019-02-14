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
const manager = __importStar(require("./manager"));
const to = require('await-to-js').default;
const util_1 = require("util");
const cron = __importStar(require("cron"));
class PrayersEventListener {
    constructor() {
    }
    onCompleted() {
        throw new Error("Method not implemented.");
    }
    onError(error) {
        console.log(error);
    }
    onNext(value) {
        try {
            manager.appmanager.homeyPrayersTrigger.trigger({ prayer_name: value.prayerName, prayer_time: value.prayerTime.toDateString() }, null)
                .then(() => console.log('event run'));
        }
        catch (err) {
            console.log(err);
        }
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
    notifyObservers(prayersTime, error) {
        super.notifyObservers(prayersTime, error);
    }
    startPrayerSchedule(date) {
        if (util_1.isNullOrUndefined(this._refreshPrayersEvent) || !this._refreshPrayersEvent.start) {
            this.runNextPrayerSchedule(date);
        }
    }
    stopPrayerSchedule() {
        if (this._refreshPrayersEvent.running)
            this._refreshPrayersEvent.stop();
    }
    runNextPrayerSchedule(date) {
        this._refreshPrayersEvent = new cron.CronJob(prayerlib.DateUtil.addDay(-1, this._prayerManager.getPrayerEndPeriond()), async () => {
            this.scheduleRefresh().then().catch((err) => { return console.log(err); });
        }, null, true);
        // this._refreshPrayersEvent.addCallback(() => { setTimeout(() => this.runNextPrayerSchedule(), 3000); });
    }
    async scheduleRefresh() {
        let startDate = this._prayerManager.getPrayerStartPeriod();
        let endDate = this._prayerManager.getPrayerEndPeriond();
        startDate = prayerlib.DateUtil.addDay(1, startDate);
        endDate = prayerlib.DateUtil.addMonth(1, endDate);
        try {
            this._prayerManager = await this._prayerManager.updatePrayersDate(startDate, endDate);
            this.notifyObservers(this._prayerManager);
        }
        catch (err) {
            this.notifyObservers(null, err);
        }
    }
}
exports.PrayersRefreshEventProvider = PrayersRefreshEventProvider;
class PrayerRefreshEventListener {
    constructor() {
    }
    onCompleted() {
    }
    onError(error) {
    }
    onNext(value) {
        manager.appmanager.prayerManager = value;
        manager.appmanager.reschedulePrayers();
    }
}
exports.PrayerRefreshEventListener = PrayerRefreshEventListener;
