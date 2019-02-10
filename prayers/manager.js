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
const util_1 = require("util");
class PrayersAppManager {
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
        let manager = PrayersAppManager.prayerAppManger;
        manager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
        manager._prayerManager = await prayerlib.PrayerTimeBuilder
            .createPrayerTimeBuilder(null, manager._prayerConfig)
            .setPrayerMethod(prayerlib.Methods.Mecca)
            .setPrayerPeriod(new Date('2019-02-10'), new Date('2019-02-28'))
            .setLocationByCoordinates(24.4942437, 54.4068603)
            .createPrayerTimeManager();
        console.log(manager._prayerManager.getUpcomingPrayer());
    }
}
exports.PrayersAppManager = PrayersAppManager;
