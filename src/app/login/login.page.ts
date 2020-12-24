import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed, NotificationChannel } from '@capacitor/core';
const { PushNotifications, Storage, LocalNotifications } = Plugins;

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
    public userUID: string;
    // tslint:disable-next-line:no-inferrable-types
    public appID: string = "24958738083736c";
    public apiKey: string = "8a5eb7dfb907f21dd697cf3e4cce4263f487d65d";
    public appRegion: string = "us";
    

    public chatID: string = 'superhero1';

    public isCometLoggedIn: boolean = false;

    constructor(public navCtrl: NavController,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router,
        private platform: Platform) {
        CometChat.init(this.appID, new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(this.appRegion).build()).then(
            initialized => {
                console.log("Initialized", initialized);
                if (initialized) {
                    CometChat.getLoggedinUser().then(user => {
                        if (user != null) {
                            console.log("getLoggedInUser", user);
                            this.router.navigate(['home']);
                        }else{
                            console.log("no logged in user");
                            CometChat.setSource('open-source-apps', 'ionic', 'ionic');
                        }
                    })
                }
            },
            error => {
                console.log('Initialization failed with error:', error);
                this.presentAlert(error.message);
            }
        );
    }

    ngOnInit() {

        if(this.platform.is("android")){
            let channel: NotificationChannel = {
                id: 'CometChat',
                name: 'CometChat Notifications',
                description: 'Show foreground notifications',
                importance: 5,
                vibration: true,
                visibility: 1
            }
            LocalNotifications.createChannel(channel)
        }

        PushNotifications.requestPermission().then( async result => {
            if (result.granted) {
                PushNotifications.register();
            } else {
                console.log('permission not granted');
            }
        });

        PushNotifications.addListener('registration', async (token: PushNotificationToken) => {
            console.log('Push registration success, token: ' + token.value);
            await Storage.set({
                key: 'fcmToken',
                value: token.value
            });
        });
    
        PushNotifications.addListener('registrationError', (error: any) => {
            console.log('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', async (notificationPayload: PushNotification) => {
            console.log('Push received: ' + JSON.stringify(notificationPayload));
            let messagePayload = JSON.parse(notificationPayload.data.message);
            console.log('here', messagePayload.id);
            let notifee;
            if(this.platform.is("android")){
                notifee = await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: notificationPayload.title,
                            body: notificationPayload.body,
                            id: 1,
                            schedule: { at: new Date(Date.now() + 1000 * 2) },
                            channelId: 'CometChat'
                        }
                    ]
                });
            }
            if(this.platform.is('ios')){
                notifee = await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: notificationPayload.title,
                            body: notificationPayload.body,
                            id: 1,
                            schedule: { at: new Date(Date.now() + 1000 * 2) }
                        }
                    ]
                });
            }
            console.log('notifee', notifee);

        });
      
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
        });
    }

    async presentAlert(alertmessage: string) {
        const alert = await this.alertController.create({
            header: 'Error',
            message: alertmessage,
            buttons: ['OK']
        });

        await alert.present();
    }

    async onSubmit(uid) {
        if(uid){
            this.userUID = uid;
        }
        const loading = await this.loadingController.create({
            message: 'Please Wait',
            spinner: 'dots',
            translucent: true
        });
        loading.present();
        CometChat.login(this.userUID, this.apiKey).then(
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

    setupPushNotification(token){
        CometChat.registerTokenForPushNotification(token, {}).then(
            () => {
              console.log('registered token successfully');
            }, error => {
              console.log('error in register token')
            }
        );
    }

    loginViaCustomUID(){
        this.router.navigate(['login-with-uid']);
    }
}