

 declare module 'homey'
{
  import { EventEmitter } from "events";

  import * as Homey from "homey";

  export class SimpleClass extends EventEmitter
  {
    constructor();
    error(...message:any[]):void;
    log(...message:any[]):void;
  }
  export class App extends SimpleClass
  {
    constructor(uri:string);
    onInit():void;

  }
  export class Device
  {

  }
  export class Driver{
    getDevice(deviceData:object):Device;
    getDevices():Array<Device>;
    onInit():void;
    onMapDeviceClass(device:Device):Device;
    onPair(socket:EventEmitter):void;
    onPairListDevices(data:object,callback:(err:Error,result:Array<Device>)=>void):void;
    ready(callback:()=>void):void;
  }
  

}

