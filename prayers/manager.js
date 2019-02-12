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
const events = __importStar(require("./events"));
const Homey = require("homey");
const util_1 = require("util");
class PrayersAppManager {
    get homeyPrayersTrigger() {
        return this._homeyPrayersTrigger;
    }
    set homeyPrayersTrigger(value) {
        this._homeyPrayersTrigger = value;
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
    // private  _prayerEvents:prayerlib.
    static async initApp() {
        try {
            exports.appmanager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
            exports.appmanager._prayerManager = await prayerlib.PrayerTimeBuilder
                .createPrayerTimeBuilder(null, exports.appmanager._prayerConfig)
                .setPrayerMethod(prayerlib.Methods.Mecca)
                .setLocationByCoordinates(Homey.ManagerGeolocation.getLatitude(), Homey.ManagerGeolocation.getLongitude())
                .createPrayerTimeManager();
            exports.appmanager.initPrayersSchedules();
            exports.appmanager.initEvents();
            console.log(exports.appmanager._prayerManager.getUpcomingPrayer());
            setTimeout(() => {
                exports.appmanager.homeyPrayersTrigger.trigger({ prayer_name: "Fajir", prayer_time: "Isha" }, null)
                    .then((result) => console.log('triggered the event' + " " + result));
            }, 60000);
        }
        catch (err) {
            console.log(err);
        }
    }
    initPrayersSchedules() {
        this._prayerEventProvider = new prayerlib.PrayersEventProvider(exports.appmanager._prayerManager);
        this._prayerEventListener = new events.PrayersEventListener();
        this._prayerEventProvider.registerListener(this._prayerEventListener);
        this._prayerEventProvider.startPrayerSchedule();
    }
    initEvents() {
        this._homeyPrayersTrigger = new Homey.FlowCardTrigger('prayer_trigger_all');
        this._homeyPrayersTrigger.register();
    }
}
exports.PrayersAppManager = PrayersAppManager;
exports.appmanager = PrayersAppManager.prayerAppManger;
