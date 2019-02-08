import dotenv = require('dotenv');
dotenv.config();
import *  as prayer from '@dpanet/prayers-lib';


let prayers: Array<object> =
    [{ prayerName: 'Fajr', prayerTime: "2019-01-31T05:46:00.000Z" },
    { prayerName: 'Sunrise', prayerTime: "2019-01-31T07:02:00.000Z" },
    { prayerName: 'Isha', prayerTime: "2019-01-31T19:27:00.000Z" },
    { prayerName: 'Dhuhr', prayerTime: "2019-01-31T12:38:00.000Z" },
    { prayerName: 'Asr', prayerTime: "2019-01-31T15:47:00.000Z" },
    { prayerName: 'Sunset', prayerTime: "2019-01-31T18:07:00.000Z" },
    { prayerName: 'Maghrib', prayerTime: "2019-01-31T18:09:00.000Z" },
    { prayerName: 'Imsak', prayerTime: "2019-01-31T05:34:00.000Z" },
    { prayerName: 'Midnight', prayerTime: "2019-01-31T00:36:00.000Z" }];
buildLocationObject().catch((err) => console.log(err));
async function buildLocationObject() {
    try {
        let prayerConfig: prayer.IPrayersConfig = await new prayer.Configurator().getPrayerConfig();
        let prayerManager: prayer.IPrayerManager = await prayer.PrayerTimeBuilder
            .createPrayerTimeBuilder(null, prayerConfig)
            .setPrayerMethod(prayer.Methods.Mecca)
            .setPrayerPeriod(new Date('2019-02-01'), new Date('2019-02-28'))
            .setLocationByCoordinates(24.4942437, 54.4068603)
            .createPrayerTimeManager();
        console.log(prayerManager.getPrayerLocation());
        // let prayerEventManager: prayer.PrayersEventProvider = new prayer.PrayersEventProvider(prayerManager);
        // prayerEventManager.registerListener(new prayer.PrayersEventListener());
        // prayerEventManager.startPrayerSchedule();
        // console.log(prayer.DateUtil.addMonth(1, prayerManager.getPrayerEndPeriond()));
        // prayerManager = await prayerManager.updatePrayersDate(new Date('2019-03-01'), new Date('2019-03-31'));
        //setTimeout(()=>{  prayerEventManager.stopPrayerSchedule();console.log('stop')},60000);
    }
    catch (err) {
        console.log(err);
    }

}

