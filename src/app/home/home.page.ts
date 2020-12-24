import { Component } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Plugins, CameraResultType } from '@capacitor/core';
const { Camera } = Plugins;
import {decode} from "base64-arraybuffer";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  receiverType: string;
  placeHolder: string;
  receiverId: string;
  textMessage: string;
  headerText: string;

  constructor(
    private router: Router,
    public actionSheetController: ActionSheetController,) {
    this.receiverType = 'user';
    this.placeHolder = "Enter UID";
    this.headerText = "Logged In as: ";
  }

  ngOnInit() {
    CometChat.getLoggedinUser().then(
      user => {
        if(user){
          this.headerText = this.headerText + user.getName();
        }else{
          this.router.navigate(['login']);
        }
      }
    )
  }

  async logout() {
    await this.actionSheetController.dismiss();
    CometChat.logout().then(
      () => {
        this.router.navigate(['login']);
      }, error => {
        console.log('Logout failed with exception:', { error });
      }
    );
  }

  segmentChanged(event){
    console.log('event', event);
    this.receiverType = event.detail.value;
    if(this.receiverType === 'user'){
      this.placeHolder = "Enter UID";
    }else{
      this.placeHolder = "Enter GUID";
    }
  }

  sendMessage(type: string){
    let receiverId = this.receiverId;
    let receiverType = this.receiverType;


    if(!receiverId){
      alert('Please enter uid/guid');
      return;
    }

    if(!receiverType){
      alert('Please select correct receiver type');
      return;
    }

    switch (type){
      case 'text': 
        this.sendTextMessage(receiverId, receiverType);
        break;
      
      case 'custom':
        this.sendCustomMessage(receiverId, receiverType);
        break;
      
      case 'media':
        this.sendMediaMessage(receiverId, receiverType);
        break;

      default:
        console.log('invalid type');
    }
    
  }

  sendTextMessage(receiverId: string, receiverType: string){
    let messageText = this.textMessage;

    if(!messageText){
      alert('Please enter appropriate text message');
      return;
    }

    let textMessage = new CometChat.TextMessage(receiverId, messageText, receiverType);
    CometChat.sendMessage(textMessage).then(
      textMessage => {
        alert('text message sent successfully');
      }, error => {
        alert('some error occured while sending text message');
      }
    );
  }

  sendCustomMessage(receiverId: string, receiverType: string){
    let customData = {
      latitude: "50.6192171633316",
      longitude: "-72.68182268750002"
    };
    let customType = "location";
    let metaData = {
      pushNotification: 'Custom Message'
    }
    var customMessage = new CometChat.CustomMessage(receiverId, receiverType, customType, customData);
    customMessage.setMetadata(metaData);
    CometChat.sendMessage(customMessage).then(
      customMessage => {
        alert('text message sent successfully');
      },
      error => {
        alert("some error occured while sending custom message");
      }
    );
  }

  async sendMediaMessage(receiverId: string, receiverType: string){
    let result = await this.takePicture();
    console.log(result);
    if(result.base64String){
      const blob = new Blob([new Uint8Array(decode(result.base64String))], {
        type: `image/${result.format}`,
      });
      const date = new Date();
      const file = new File([blob], 'temp_img' + date.getTime(), {
        lastModified: date.getTime(),
        type: blob.type,
      });
      var messageType = CometChat.MESSAGE_TYPE.IMAGE;

      var mediaMessage = new CometChat.MediaMessage(receiverId, file, messageType, receiverType);

      CometChat.sendMediaMessage(mediaMessage).then(
        mediaMessage => {
          console.log(mediaMessage);
          alert('media message sent successfully');
        },
        error => {
          console.log(error);
          alert("some error occured while sending media message");
        }
      );
    }
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });
    return image;
  }

  dataURItoBlob(dataURI) {
    const byteString = atob(dataURI);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const bb = new Blob([ab], {type: mimeString});
    return bb;
  }

  initiateCall(type: string){
    let receiverId = this.receiverId;
    let receiverType = this.receiverType;

    if(!receiverId){
      alert('Please enter uid/guid');
      return;
    }

    if(!receiverType){
      alert('Please select correct receiver type');
      return;
    }

    var call = new CometChat.Call(receiverId, type, receiverType);
    CometChat.initiateCall(call).then(
      outGoingCall => {
        alert("Call initiated successfully");
      },
      error => {
        alert("some error occured while initializing a call");
      }
    );
  }

  async presentActionSheet(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const actionSheet = await this.actionSheetController.create({
      header: this.headerText,
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Logout',
          role: 'destructive',
          icon: 'power',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    await actionSheet.present();
  }

}
