import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/toPromise"
import { Config } from './../config/config';

@Injectable()
export class StudentService {
  data:any;
  apiUrl:any;
  constructor (
    private http: Http,
    private _config: Config
  ) {}
  
  getStudents() {
      return this._config.load()
      .then(()=>{
        return this.http.get(`${this._config.get('appUrl')}/modules/studentreg/studentreg.php`)
        .map((res:Response) => res.json())
        .map(data =>{
          return data.list;
        }).toPromise();
      });
  }

}
