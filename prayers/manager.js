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
const Debug = require("debug");
const debug = Debug("1");
const prayerlib = __importStar(require("@dpanet/prayers-lib"));
const events = __importStar(require("./events"));
const Homey = require("homey");
const util_1 = require("util");
const to = require('await-to-js').default;
const athanTypes = { athan_short: "assets/prayers/prayer_short.mp3", athan_full: "assets/prayers/prayer_full.mp3" };
class PrayersAppManager {
    get prayerEventProvider() {
        return this._prayerEventProvider;
    }
    set prayerEventProvider(value) {
        this._prayerEventProvider = value;
    }
    static get prayerAppManger() {
        if (!util_1.isNullOrUndefined(PrayersAppManager._prayerAppManger))
            return PrayersAppManager._prayerAppManger;
        else {
            PrayersAppManager._prayerAppManger = new PrayersAppManager();
            return PrayersAppManager._prayerAppManger;
        }
    }
    static set prayerAppManger(value) {
        PrayersAppManager._prayerAppManger = value;
    }
    get prayerManager() {
        return this._prayerManager;
    }
    set prayerManager(value) {
        this._prayerManager = value;
    }
    // private  _prayerEvents:prayerlib.
    static async initApp() {
        try {
            exports.appmanager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
            exports.appmanager._prayerManager = await prayerlib.PrayerTimeBuilder
                .createPrayerTimeBuilder(null, exports.appmanager._prayerConfig)
                .setPrayerMethod(prayerlib.Methods.Mecca)
                .setPrayerPeriod(prayerlib.DateUtil.getNowDate(), prayerlib.DateUtil.addDay(1, prayerlib.DateUtil.getNowDate()))
                .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
                .createPrayerTimeManager();
            exports.appmanager.initPrayersSchedules();
            exports.appmanager.initEvents();
            console.log(exports.appmanager._prayerManager.getUpcomingPrayer());
        }
        catch (err) {
            console.log(err);
        }
    }
    // initallize prayer scheduling and refresh events providers and listeners
    initPrayersSchedules() {
        this._prayerEventProvider = new events.PrayersEventProvider(this._prayerManager);
        this._prayerEventListener = new events.PrayersEventListener(this);
        this._prayerEventProvider.registerListener(this._prayerEventListener);
        this._prayerEventProvider.startPrayerSchedule();
        this._prayersRefreshEventProvider = new events.PrayersRefreshEventProvider(this._prayerManager);
        this._prayersRefreshEventListener = new events.PrayerRefreshEventListener(this);
        this._prayersRefreshEventProvider.registerListener(this._prayersRefreshEventListener);
    }
    //schedule refresh of prayers schedule based on date 
    scheduleRefresh(date) {
        this._prayersRefreshEventProvider.startPrayerRefreshSchedule(date);
    }
    //initialize Homey Events
    initEvents() {
        this._homeyPrayersTriggerAll = new Homey.FlowCardTrigger('prayer_trigger_all');
        this._homeyPrayersTriggerSpecific = new Homey.FlowCardTrigger('prayer_trigger_specific');
        this._homeyPrayersAthanAction = new Homey.FlowCardAction('athan_action');
        this._homeyPrayersTriggerAll.register();
        this._homeyPrayersAthanAction
            .register()
            .registerRunListener(async (args, state) => {
            this.playAthan(args.athan_dropdown, athanTypes[args.athan_dropdown])
                .then((value) => {
                console.log(value);
                return value;
            })
                .catch((err) => {
                console.log(err);
                return Promise.resolve(false);
            });
        });
        this._homeyPrayersTriggerSpecific
            .register()
            .registerRunListener((args, state) => {
            return (args.athan_dropdown === state.prayer_name);
        });
    }
    //play athan based on trigger
    async playAthan(sampleId, fileName) {
        console.log(sampleId);
        let err, result;
        Homey.ManagerAudio.playMp3(sampleId, fileName)
            .then(() => {
            console.log(err);
            return Promise.resolve(false);
        })
            .catch((err) => {
            console.log(err);
            return Promise.resolve(true);
        });
        return Promise.resolve(true);
    }
    //trigger homey event based on prayer scheduling event.
    triggerEvent(prayerName, prayerTime) {
        let timeZone = this._prayerManager.getPrayerTimeZone().timeZoneId;
        let prayerTimeZone = prayerlib.DateUtil.getDateByTimeZone(prayerTime, timeZone);
        this._homeyPrayersTriggerAll
            .trigger({ prayer_name: prayerName, prayer_time: prayerTimeZone }, null)
            .then(() => console.log('event all run'))
            .catch((err) => {
            this.prayerEventProvider.stopPrayerSchedule();
            console.log(err);
        });
        this._homeyPrayersTriggerSpecific.trigger({ prayer_name: prayerName, prayer_time: prayerTimeZone }, null)
            .then(() => console.log('event specific run'))
            .catch((err) => {
            this.prayerEventProvider.stopPrayerSchedule();
            console.log(err);
        });
    }
    //refresh prayer manager in case we reach the end of the array.
    refreshPrayerManager() {
        let startDate = prayerlib.DateUtil.getNowDate();
        let endDate = prayerlib.DateUtil.addMonth(1, startDate);
        this.prayerManager.updatePrayersDate(startDate, endDate)
            .then((value) => {
            this.prayerEventProvider.startPrayerSchedule(value);
            // this._prayerManager = value;
        })
            //retry every date until the prayer refresh task is done.
            .catch((err) => {
            console.log(err);
            let date = prayerlib.DateUtil.addDay(1, startDate);
            this.scheduleRefresh(date);
        });
    }
}
exports.PrayersAppManager = PrayersAppManager;
exports.appmanager = PrayersAppManager.prayerAppManger;
