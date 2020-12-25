import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Plugins } from '@capacitor/core';
const {  Storage } = Plugins;
import COMETCHAT_DETAILS from '../../consts';

@Component({
  selector: 'app-login-with-uid',
  templateUrl: './login-with-uid.page.html',
  styleUrls: ['./login-with-uid.page.scss'],
})
export class LoginWithUidPage implements OnInit {
  uid: any;

  constructor(
    public navCtrl: NavController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router) { }

  ngOnInit() {
  }

  async onSubmit() {
    if(!this.uid){
      this.presentAlert('Please enter valid UID');
      return;
    }
    const loading = await this.loadingController.create({
        message: 'Please Wait',
        spinner: 'dots',
        translucent: true
    });
    loading.present();
    CometChat.login(this.uid, COMETCHAT_DETAILS.authKey).then(
      async user => {
        console.log("user Login via apiKey", user);
        loading.dismiss();
        const { value } = await Storage.get({ key: 'fcmToken' });
        this.setupPushNotification(value);
        this.router.navigate(['home']);
      },
      error => {
        loading.dismiss();
        this.presentAlert(error.message);
      }
    );
  }

  async presentAlert(alertmessage: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: alertmessage,
      buttons: ['OK']
    });
    await alert.present();
  }

  setupPushNotification(token){
    CometChat.registerTokenForPushNotification(token, {}).then(
      () => {
        console.log('registered token successfully');
      }, error => {
        console.log('error in register token')
      }
    );
  }

}
