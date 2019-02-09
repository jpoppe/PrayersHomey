import dotenv = require('dotenv');
dotenv.config();
import *  as prayer from '@dpanet/prayers-lib';
import Homey = require('homey');

class AxisApp extends Homey.App {

    onInit() {
        this.log(` AxisApp is running! `);
        Homey.__('hi');
    }
    

}

module.exports = AxisApp;

