

 declare module 'homey'
{
  import { EventEmitter } from "events";

  import * as Homey from "homey";

  export interface ICapabilities
  {
    capabilityId:string;
  }
  export class SimpleClass extends EventEmitter
  {
    constructor();
    public error(...message:any[]):void;
    public log(...message:any[]):void;
  }
  export class App extends SimpleClass
  {
    constructor(uri:string);
    protected onInit():void;
  }
  type genericCallbackFunction= (err?:Error,store?:object)=>void;

  export class Device
  {
    public getAvailable():boolean;
    public getCapabilities():Array<ICapabilities>;
    public getCapabilityValue(capabilityId:string):ICapabilities;
    public getClass():string;
    public getData():object;
    public getDriver():Driver;
    public getName():string;
    public getSetting(key:string):object;
    public getSettings():object;
    public getState():object;
    public getStore():object;
    public getStoreKeys():Array<string>;
    public getStoreValue(key:string):any;
    public hasCapability(capabilityId:string):boolean;
    public onAdded():void;
    public onDeleted():void;
    public onInit():void;
    public onRenamed(name:string):void;
    public onSettings(oldSettings:object,newSettings:object,changedKeys:Array<object>,callback:genericCallbackFunction):void;
    public ready(callback:()=>void):void;
    public registerCapabilityListener(capabilityId:string,fn:(value:any,opt:object,callback:genericCallbackFunction)=>void):void;
    public registerMultipleCapabilityListener(capabilityIds:Array<string>,fn:(valueObj:any,optsObj:object,callback:genericCallbackFunction)=>void,timeout:number):void;
    public setAlbumArtImage(image:Image,callback?:(err:Error)=>void):Promise<any>;
    public setAvailable(callback?:genericCallbackFunction):Promise<any>;
    public setCapabilityValue(capabilityId:string,value:any,callback?:genericCallbackFunction):Promise<any>;
    public setSettings(settings:object,callback?:genericCallbackFunction):Promise<any>;
    public setStoreValue(key:string,value:any,callback?:genericCallbackFunction):Promise<any>;
    public setUnavailable(message:string,callback?:genericCallbackFunction):Promise<any>;
    public setWarning(message:string,callback?:genericCallbackFunction):Promise<any>;
    public triggerCapabilityListener(capabilityId:string,value:any,opts:object,callback?:genericCallbackFunction):Promise<any>;
    public unsetStoreValue(key:string,callback?:genericCallbackFunction):Promise<any>;
    public usetWarning(callback?:genericCallbackFunction):Promise<any>;
  }
  export class Driver{
    public getDevice(deviceData:object):Device;
    public getDevices():Array<Device>;
    public onInit():void;
    public onMapDeviceClass(device:Device):Device;
    public onPair(socket:EventEmitter):void;
    public onPairListDevices(data:object,callback:(err:Error,result:Array<Device>)=>void):void;
    public ready(callback:()=>void):void;
  }
  export class Image
  {

  }
  export class FlowArgument
  {
    public registerAutocompleteListener(query:string,args:object,callback:(err:Error,result:Array<object>)=>void):FlowArgument;
  }
  export class FlowCard
  {
    constructor(id:string);
    getArgument():FlowArgument;
    getArgumentValues(callback:(err:Error,value:Array<object>)=>void):Promise<any>;
    register():FlowCard;
    registerRunListener(fn:(args:object,state:object,callback:genericCallbackFunction)=>void):FlowCard;

  }

  
}

