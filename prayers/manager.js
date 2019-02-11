"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    static initApp() {
        return __awaiter(this, void 0, void 0, function* () {
            let manager = PrayersAppManager.prayerAppManger;
            //  manager._prayerConfig = await new prayerlib.Configurator().getPrayerConfig();
            manager._prayerManager = yield prayerlib.PrayerTimeBuilder
                .createPrayerTimeBuilder(null, null)
                .setPrayerMethod(prayerlib.Methods.Mecca)
                .setPrayerPeriod(new Date('2019-02-10'), new Date('2019-02-28'))
                .setLocationByCoordinates(24.4942437, 54.4068603)
                .createPrayerTimeManager();
            console.log(manager._prayerManager.getUpcomingPrayer());
        });
    }
}
exports.PrayersAppManager = PrayersAppManager;
