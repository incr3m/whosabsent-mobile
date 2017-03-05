import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/toPromise"
import { Config } from './../config/config';


@Injectable()
export class NodeapiService {
  private static instance: NodeapiService = null;
  adminId:string;
  adminDetails:any;
  constructor (
    private http: Http,
    private _config: Config
  ) {
    return NodeapiService.instance = NodeapiService.instance || this;
  }
  logout(){
    return this._config.load()
      .then(()=>{
        window.location.href = this._config.get('appUrl')+'/login/logout.php?mobile=1';
      });
  }
  login(){
    return this._config.load()
      .then(()=>{
        window.location.href = this._config.get('appUrl')+'/login/login.php?mobile=1';
      });
  }
  getToApp(url,params,auth?){
    let xparams: URLSearchParams = new URLSearchParams();
      
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          var element = params[key];
          xparams.set(key, element);
        }
      }
      let requestOptions = new RequestOptions();
      requestOptions.search = xparams;
      return this._config.load()
      .then(()=>{
        return this.http.get(`${this._config.get('appUrl')}/${url}`,{
          search: xparams
        })
        .map((res:Response) => res.json())
        .map(data =>{
          console.log('data');
          console.log(data);
          if(auth&&data['authError']){
            console.log('redirect');
          //  window.location.href = this._config.get('appUrl')+'/index.php?mobile=1';
          }
          return data;
        }).toPromise();
      });
  }

  postToApp(url,params){
    return this._config.load()
      .then(()=>{
        return new Promise((resolve, reject) => {
          let xhr:XMLHttpRequest = new XMLHttpRequest();
          xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                      console.log(xhr.response);
                      let ret = JSON.parse(xhr.response);
                      resolve(ret);
                      // return ret;
                  } else {
                      reject(xhr.response);
                  }
              }
          };
          xhr.open('POST', `${this._config.get('appUrl')}/${url}`, true);
          let formData = new FormData();
          for (var key in params) {
            if (params.hasOwnProperty(key)) {
              var element = params[key];
              formData.append(key,element); 
            }
          }
          xhr.send(formData);
        });
      });
  }
  postToApi(url,params){
    return this._config.load()
      .then(()=>{
        return new Promise((resolve, reject) => {
          let xhr:XMLHttpRequest = new XMLHttpRequest();
          xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                      console.log(xhr.response);
                      let ret = JSON.parse(xhr.response);
                      resolve(ret);
                      // return ret;
                  } else {
                      reject(xhr.response);
                  }
              }
          };
          xhr.open('POST', `${this._config.get('apiUrl')}/${url}`, true);
          let formData = new FormData();
          for (var key in params) {
            if (params.hasOwnProperty(key)) {
              var element = params[key];
              formData.append(key,element); 
            }
          }
          xhr.send(formData);
        });
      });
  }
  upload(accountIdNo,key,file){
    return this._config.load()
      .then(()=>{
        return new Promise((resolve, reject) => {
          let xhr:XMLHttpRequest = new XMLHttpRequest();
          xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                      console.log(xhr.response);
                      let ret = JSON.parse(xhr.response);
                      resolve(ret);
                      // return ret;
                  } else {
                      reject(xhr.response);
                  }
              }
          };

          xhr.open('POST', `${this._config.get('apiUrl')}/upload`, true);

          let formData = new FormData();
          formData.append('accountId',accountIdNo);
          formData.append('key',key);
          formData.append("avatar", file, file.name);
          xhr.send(formData);
        
        });
                
      });
    
  }
  getS3Settings(key:string) {
      let xparams: URLSearchParams = new URLSearchParams();
      xparams.set('key', key);
      let requestOptions = new RequestOptions();
      requestOptions.search = xparams;
      return this._config.load()
      .then(()=>{
        return this.http.get(`${this._config.get('apiUrl')}/s3settings`,{
          search: xparams
        })
        .map((res:Response) => res.json())
        .map(data =>{
          return data;
        }).toPromise();
      });
  }

}
