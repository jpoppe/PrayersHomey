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
const manager = __importStar(require("./manager"));
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
