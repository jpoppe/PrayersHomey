import dotenv = require('dotenv');
dotenv.config();

import Homey = require('homey');
import * as manager from './prayers/manager';

class PrayersApp extends Homey.App {

    onInit() {
        this.log(` Prayers Alert App is running! `);
        manager.PrayersAppManager.initApp();
    }
    

}

module.exports = PrayersApp;

