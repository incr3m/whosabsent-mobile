import { Component, OnInit } from '@angular/core';
import { NodeapiService } from './../shared/nodeapi.service';
import { Config } from './../config/config';
@Component({
  selector: 'app-dashboard',
  templateUrl: './full-layout.component.html',
  providers: [NodeapiService,Config]   
})
export class FullLayoutComponent implements OnInit {

  constructor(private nodeApiService: NodeapiService) { }

  public disabled:boolean = false;
  public status:{isopen:boolean} = {isopen: false};

  public toggled(open:boolean):void {
    console.log('Dropdown is now: ', open);
  }
  public logoutClick($event){
    this.nodeApiService.logout();
  }
  public toggleDropdown($event:MouseEvent):void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }
  public getAdminUserName(){
    
    if(!this.nodeApiService.adminDetails) return '';
    return this.nodeApiService.adminDetails['name'];
  }
  ngOnInit(): void {
    this.nodeApiService.getToApp('/auth.php',{},true)
    .then(auth=>{
      console.log('auth');
      console.log(auth);
      if(!auth['idno']){
        
      }
    });
  }
}
