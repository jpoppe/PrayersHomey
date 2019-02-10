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
const Homey = require("homey");
const manager = __importStar(require("./prayers/manager"));
class PrayersApp extends Homey.App {
    onInit() {
        this.log(` Prayers Alert App is running! `);
        manager.PrayersAppManager.initApp();
    }
}
module.exports = PrayersApp;
