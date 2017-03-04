import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
 export class Config {
 private _config: Object
 private _env: Object
 constructor(private http: Http) {
     console.log('loading...');
     
 }
 private checkLoad(){
    //  if(this._config){

    //  }
 }
 public load() {
   return new Promise((resolve, reject) => {
    if(this._config){
        resolve(true);
        return;
    }
    this.http.get('src/app/config/env.json')
    .map(res => res.json())
    .subscribe((env_data) => {
        console.log('done.1.');
        this._env = env_data;
        this.http.get('src/app/config/' + env_data.env + '.json')
        .map(res => res.json())
        .subscribe((data) => {
        console.log('done.2.');
        console.log(data);
        
        this._config = data;
        resolve(true);
        });
    });
 });
 }
 getEnv(key: any) {
   return this._env[key];
 }
 get(key: any) {
   return this._config[key];
 }
};