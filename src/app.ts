import dotenv = require('dotenv');
dotenv.config();
import *  as prayer from '@dpanet/prayers-lib';
import Homey = require('homey');

class AxisApp extends Homey.App {

    onInit() {
        this.log(` AxisApp is running! `);
        Homey.__('hi');
        let rainStartTrigger:Homey.FlowCardTrigger<Homey.FlowCardTrigger<any>> = new Homey.FlowCardTrigger('rain_start');

        let tokens = {
          'mm_per_hour': 3,
          'city': 'New York'
        }
        
        rainStartTrigger.register().trigger(tokens,null).then(this.log);
        let myToken = new Homey.FlowToken( 'my_token', {
            type: "number",
            title: 'My Token'
          });
          myToken.register()
            .then(() => {
              return myToken.setValue(23.8);
            })
            .catch( err => {
              this.error( err );
            });
        //   .register()
        //   .trigger( tokens )
        //     .catch( this.error )
        //     .then( this.log )
    }
    

}

module.exports = AxisApp;

