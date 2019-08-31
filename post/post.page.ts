import { Component, Input, OnInit ,ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import { NavController, ModalController , LoadingController, ToastController, ActionSheetController,Platform} from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Http ,Headers, RequestOptions } from '@angular/http';
import { AuthenticationService } from '../../../services/authentication.service';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FormBuilder, FormGroup, FormArray} from  '@angular/forms';
import { Crop } from '@ionic-native/crop/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
 
import { finalize } from 'rxjs/operators';
 
const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-image',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
  @Input() value: any;
  public userData : any;
  public body: string;
  public posts : any[];
  //images = [];
 public form: FormGroup;
  imageResponse: any;
  options: any;
  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    public http: Http,
    public auth: AuthenticationService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private camera: Camera, 
    private file: File,
    private webview: WebView,
    private actionSheetController: ActionSheetController,
    private storage: Storage, 
    private plt: Platform,
    private ref: ChangeDetectorRef, 
    private filePath: FilePath,
    private formBuilder: FormBuilder,
    private imagePicker: ImagePicker,
    private crop: Crop,
    private transfer: FileTransfer
  ) {


  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.form = this.formBuilder.group({
       images : this.formBuilder.array([])
      });
    
  }

  closeModal() {

     var apiHost = this.auth.getApiurl('getposts');
     
     this.http.get(apiHost)
    .subscribe((res) => {
         this.posts = res.json().posts;
         this.modalCtrl.dismiss(this.posts);
    });
        
    this.navCtrl.navigateForward('/home-results');
  }

// We will create multiple form controls inside defined form controls photos.
createItem(data): FormGroup {
    return this.formBuilder.group(data);
}

preview_images(event) 
{
 let files = event.target.files;
    if (files) {
       this.images.controls.length=0;
        for (let file of files) {
            let reader = new FileReader();
            reader.onload = (e: any) => {
                this.images.push(this.createItem({
                    file,
                    url: e.target.result  //Base64 string for preview image
                }));
            }
            reader.readAsDataURL(file);
        }
    }
}

get images(): FormArray {
    return this.form.get('images') as FormArray;
};
 

async sharePost(){
   const loader = await this.loadingCtrl.create({
       duration: 2000
     });
     const formData = new FormData();
      let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'multipart/form-data');
            let options = new RequestOptions({ headers: headers });
        this.images.controls.forEach(function(entry) {
            console.log(entry.value.file.name);
            formData.append('uploadfiles[]',entry.value.file,entry.value.file.name);
        });
        
        formData.append('body', this.body);
        formData.append('user_id', this.userData.user.id);
    var apiHost = this.auth.getApiurl('createpost');
     //console.log(formData.get("uploadfiles"));
      this.http.post(apiHost,formData).subscribe((res) => {
       console.log(res.json());
       this.closeModal();
     });
     loader.present();
     
  }


  getImages() {
    this.options = {
      
      width: 200,
      outputType: 1
    };
    this.imageResponse = [];
    this.imagePicker.getPictures(this.options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        this.imageResponse.push('data:image/jpeg;base64,' + results[i]);
      }
    }, (err) => {
      alert(err);
    });
  }


  }

