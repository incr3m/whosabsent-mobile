import { Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';

import { StudentService } from './../shared/student.service';
import { NodeapiService } from './../shared/nodeapi.service';
import { Config } from './../config/config';
import * as _ from 'underscore';
import * as AWS from 'aws-sdk';
import { ActivatedRoute } from '@angular/router';
// import * as S3Uploader from 's3-uploader';



enum ControlMode  {
    new,
    attendance,
    studentinfo,
    newstudent
}  

@Component({
  templateUrl: 'dashboard.component.html',
  providers: [Config, StudentService, NodeapiService]   
})
export class DashboardComponent implements OnInit {
  
  @ViewChild('myInput')
  myInputVariable: any;
  constructor(
     private studentService: StudentService,
     private nodeApiService: NodeapiService,
     private route: ActivatedRoute
  ) { 
    this.route.params.subscribe(params => {
      console.log('params[id]');
      console.log(params['id']);
      if(!params['id']){
        this.nodeApiService.login();
      }
      this.nodeApiService.adminId = params['id'];
      this.nodeApiService.getToApp('api.php',{getUserId:this.nodeApiService.adminId})
      .then(data=>{
        console.log('set admin data');
        this.nodeApiService.adminDetails = data;
        console.log(this.nodeApiService.adminDetails);
      })
      //  this.id = +params['id']; 
    });
  }

  controlModes = ControlMode;
  public brandPrimary:string =  '#20a8d8';
  public brandSuccess:string =  '#4dbd74';
  public brandInfo:string =   '#63c2de';
  public brandWarning:string =  '#f8cb00';
  public brandDanger:string =   '#f86c6b';
  public mode:ControlMode = ControlMode.new;
  public uploadPreviewSrc = '';
  public setAsStudentPhoto = false;
  public setAsAttendance = false;
  public setAsPrimaryPhoto = true;
  public processing = false;
  public studentList: any;
  public sectionList: any;
  public s3settings: any;
  private bucketName = 'incrm.whosabsent';
  private s3client:any;
  public photoUploading = false;
  public postprocessmsg = '';
  public selectedStudent = {
    accountidno : '',
    name: ''
  }
  public selectedSection = {
    idno : '',
    name: ''
  }
  public searchedStudent:any;
  public newStudentForm = {
    firstname: '',
    middlename: '',
    lastname: '',
    username: '',
    password: '',
    confirmpassword: '',
    forcemode: 'create',
    roles: 'STUDENT',
    userIdToken: ''
  }
  public newStudentFormError = '';

  private startProcessing(){
    this.processing = true;
  }
  private endProcessing(info?:string){
    this.processing = false;
    this.postprocessmsg = info?info:'';
    this.mode = ControlMode.new;
  }
  public registerNewStudentClicked($event){
    this.mode = ControlMode.newstudent;
  }
  public registerNewStudentSubmitClicked($event){
    // this.mode = ControlMode.new;
    console.log(this.newStudentForm);
    this.newStudentForm.userIdToken = this.nodeApiService.adminId;
    let valid = true;
    this.newStudentFormError = '';
    for (var key in this.newStudentForm) {
      if (this.newStudentForm.hasOwnProperty(key)) {
        var element = this.newStudentForm[key];
        if(!element||element===""){
          valid = false;
          alert(`field '${key}' should not be empty`);
        }
      }
    }
    if(valid){
      this.nodeApiService.postToApp('/modules/account/registerstudent.php',this.newStudentForm)
      .then((data:any)=>{
        console.log('search result');
        console.log(data);
        this.newStudentFormError = '';
        let err =data['errors'];
        if(err){
          console.log('error occurred');
          console.log(err);
          this.newStudentFormError = err;
          console.log(this.newStudentFormError);
        }
        else if(data['idno']){
          this.selectedStudent = {
            accountidno: data['idno'],
            name: this.newStudentForm.firstname
          }
          this.startProcessing();
          this.submitPhotoClickListener($event);
        }
        
      },err=>{
        console.log('error occurred');
        console.log(err);
        this.newStudentFormError = err['errors'];
        console.log(this.newStudentFormError);
        
      });
    }
  }
  public registerNewStudentCancelClicked($event){
    this.newStudentForm = {
      firstname: '',
      middlename: '',
      lastname: '',
      username: '',
      password: '',
      confirmpassword: '',
      forcemode: 'create',
      roles: 'STUDENT',
      userIdToken: this.nodeApiService.adminId
    };
    this.newStudentFormError = '';
    this.mode = ControlMode.new;
  }
  public submitPhotoClickListener($event){
    // console.log(this.myInputVariable.nativeElement.files[0]);
    // console.log('uploadPreviewSrc');
    // console.log(this.uploadPreviewSrc);

    this.processing = true;
    var bucketUpl = new AWS.S3();
    var file = this.myInputVariable.nativeElement.files[0];
    if (file) {
      this.send(file)
      .then(data=>{
        if(!data['ok']) return;
        if(!data['faceId']) {
          alert('no face id found');
          return;
        }
          
        this.nodeApiService.postToApp('modules/account/photo/photo.php',{
          newphotoidno:data['accountId'],
          filename:data['savedKey'],
          faceId:data['faceId'],
          isprimary:this.setAsPrimaryPhoto
        })
        .then(res=>{
          console.log('res');
          console.log(res);
          this.endProcessing('Registration Done!');
          this.readThis(this.myInputVariable.nativeElement);
        },err=>{
          console.log('err');
          console.log(err);
          this.endProcessing('Error occurred! '+err);
        });
      },err=>{
        console.log('err');
        console.log(err);
        this.endProcessing('Error occurred! '+err);
      })
      
      
    }
  }

  public sectionSelectChanged($event){
    console.log(this.selectedSection.idno);
    

    let qSection = _.find(this.sectionList, function(item) {
        return item.idno == $event; 
    });
    this.selectedSection.name = qSection.name;
    
    console.log(this.selectedSection);
  }

  public studentSelectChanged($event){
    console.log(this.selectedStudent.accountidno);
    

    let qStudent = _.find(this.studentList, function(item) {
        return item.accountidno == $event; 
    });
    this.selectedStudent.name = qStudent.name;
    
    console.log(this.selectedStudent);
  }

  public setAsStudentPhotoClicked($event) : void{
      this.mode = ControlMode.studentinfo;
  }
  public setAsAttendanceClicked($event) : void{
      this.mode = ControlMode.attendance;
  }
  public hideSetAttendanceButton(){
    return !this.uploadPreviewSrc;
  }

  public changeListener($event) : void {
    if(this.photoUploading) return;
    this.photoUploading = true;
    this.readThis($event.target);
  }
  public submitAccountLog($event):void {
    this.startProcessing();
    console.log('section');
    console.log(this.selectedSection);
    
    console.log(this.selectedSection.idno);
    let spl = this.selectedSection.idno.split(':');
    let xparams = {
      cmd:'accountlog',
      sectionidno:spl[0],
      subjectidno:spl[1],
      accountidno:this.searchedStudent['idno']
    };
    console.log(xparams);
    
    this.nodeApiService.getToApp('modules/api.php',xparams
      )
    .then(data=>{
      console.log('fetch return data from cwd accountlog');
      console.log(data);
      this.searchedStudent = data;
      this.endProcessing();
    })
    
  }
  public readThis(inputValue: any) : void {
    var self = this;
    var file:File = inputValue.files[0]; 
    var myReader:FileReader = new FileReader();

    myReader.readAsDataURL(file);
    myReader.onloadend = function(e){
      self.mode = ControlMode.new;
      self.uploadPreviewSrc = myReader.result;
      console.log('searching..');
      if(file){
        self.nodeApiService.postToApi('search',{
          avatar:file,
          key:new Date().toString()
        })
        .then((data:any)=>{
          console.log('search result');
          console.log(data);
          if(data['FaceMatches'].length>0){
            let match = data['FaceMatches'][0];
            let accountIdNo = match['Face']['ExternalImageId'];
            self.fetchAccountInfo(accountIdNo);
          }
          else{
            self.searchedStudent = {};
            self.searchedStudent['notfound'] = true;
          }
          self.photoUploading = false;
        },err=>{
          console.log('error occurred');
          console.log(err);
          self.photoUploading = false;
        });
      }
      
    }
    
    
  }
  
  public fetchAccountInfo(accountidno){
    this.nodeApiService.getToApp('api.php',{getUserId:accountidno})
    .then(data=>{
      console.log('fetch user data');
      console.log(data);
      if(data['usn']){
        this.nodeApiService.getToApp('modules/api.php',{usn:data['usn']})
        .then(data=>{
          console.log('fetch user data from usn');
          console.log(data);
          this.searchedStudent = data;
          this.endProcessing();
        })
      }
      else{
        this.endProcessing('Usn not found.');
      }
    })
  }

  public selectNewClickListener($event) : void{
    this.uploadPreviewSrc = '';
    this.myInputVariable.nativeElement.value = "";
    this.myInputVariable.nativeElement.click();
  }
 
  
  private send(file) {
    if(!this.selectedStudent.accountidno) return;
    
    let key = Date.now().toString();
    return this.nodeApiService.upload(this.selectedStudent.accountidno,key,file);
  }

  ngOnInit(): void {

    
    // this.studentList = [{ id: '', name: "Select Student" },{id:1,name:'test1'},{id:2,name:'test2'}]
    this.studentService.getStudents()
    .then((list)=>{
      console.log('student list');
      console.log(list);
      this.studentList = list;
    });
    this.nodeApiService.getToApp('modules/api.php',{sections:1})
    .then((data:any)=>{
      console.log('section list');
      console.log(data);
      this.sectionList = [];
      for (var index = 0; index < data.list.length; index++) {
        var element = data.list[index];
        let section = {
          idno:`${element['sectionidno']}:${element['subjectidno']}`,
          name:`${element['sectioncode']} / ${element['subjectcode']}`
        }
        this.sectionList.push(section);
      }
    });

    AWS.config.update({
        accessKeyId : 'AKIAICJXZHALRWXXBLZQ',
        secretAccessKey : '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'
    });
    AWS.config.region = 'us-west-2';


    

  }
}
