import dotenv = require('dotenv');
dotenv.config();
import * as prayerlib from '@dpanet/prayers-lib';
import * as manager from './manager';

export class PrayersEventListener implements prayerlib.IObserver<prayerlib.IPrayersTiming>
{
    constructor()
    {
    }
    onCompleted(): void {
        throw new Error("Method not implemented.");
    }
    onError(error: Error): void {
        console.log(error);
    }
    onNext(value: prayerlib.IPrayersTiming): void {
        try {
            manager.appmanager.homeyPrayersTrigger.trigger({prayer_name:value.prayerName,prayer_time:value.prayerTime.toDateString()},null)
            .then(()=>console.log('event run'));

        } catch (err) {
            console.log(err);
        }
    }
}