import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService } from '../services/api.service'; //'../../services/api.service';
import { AlertController } from '@ionic/angular';
import { AppdataService } from '../appdata.service';
import { LocalNotifications, LocalNotificationActionPerformed } from '@capacitor/local-notifications';
import { Local } from 'protractor/built/driverProviders';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentials: FormGroup;

  constructor(private apiService :ApiService,
              private router: Router,
              private fb: FormBuilder,
              private alertCtrl: AlertController,
              private appDataService: AppdataService
              ) { }

  async ngOnInit() {
    this.credentials = this.fb.group({
      email: [''],
      password: [''],

    });

    await LocalNotifications.requestPermissions();
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'TOMA DE MEDICAMENTO',
          actions: [
            {
              id: 'tomar',
              title: 'N. Toma',
              input: true
            }
          ]
        }
      ]
    });

    // Incluimos accion cuando el paciente toca en la notificacion.
    LocalNotifications.addListener('localNotificationActionPerformed', (notification: LocalNotificationActionPerformed) => {
      console.log("Paciente se da por enterado de la notificacion.");
      console.log('Enviamos notoficiación');
    });
  }

  async login() {
    //Esto es una prueba , tenemos que ver como hacemos finalmente el login y el subscribe.
    await this.apiService.login(this.credentials.value).subscribe(data => {
      if (data === true) {
          //Consultamos los medicamentos.
          this.apiService.getMedicamentosActuales().subscribe(medicamentos => {
            if (medicamentos !== false) {
              console.log(medicamentos);

              // Si recibimos un true, continuamos a la pantalla de menus.
              console.log('Entramos en menu de paciente.');

              //Guardamos los medicamentos.
              this.appDataService.setMedicamentos(medicamentos);

              //Eliminamos las notificaciones anteriores.
              for (let i: number = 0; i < 20; i++) { //TODO: Maximo 20 notificaciones.
                LocalNotifications.cancel({
                  notifications: [
                    {
                      id: i
                    }
                  ]
                });
              }


              // Programamos los medicamentos
              for (let i = 0; i < this.appDataService.getMedicamentos().length; i++){
                this.programaNotificacion(this.appDataService.getMedicamentos()[i]['nombre'],
                                          this.appDataService.getMedicamentos()[i]['toma'],
                                          this.appDataService.getMedicamentos()[i]['every'],
                                          i).then(data => {
                  console.log("Notificacion agendada.");
                });
              }


              //Navegamos a la pantalla que muestra los medicamentos.
              this.router.navigateByUrl('medicamentos');
            } else {
              console.log("Error: No hay medicamentos encontrados.");
            }
          });
      } else {
        // En caso de que haya error nos quedamos en login.
        this.showText('Contraseña incorrecta!');

      }
    })

  }
  async showText(texto: any) {
    const alert = await this.alertCtrl.create({
      inputs: [
        {
          name: 'checkbox1',
          type: 'checkbox',
          label: 'Checkbox 1',
          value: 'value1',
          checked: true
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });
    await alert.present();
  }


  /**
     * Funcion que programa las alertas para tomar un medicamento.
     * @param medicamentoNombre NOmbre del medicamento para que aparezca en la notificacion.
     * @param intervalo INtervalo de tiempo en el que debe aparecer.
     */
   async programaNotificacion(medicamentoNombre: string, intervalo:string, _every:any, _id:any) {
     console.log('INformacion recibida para alarma: '+medicamentoNombre+' intervalo: '+intervalo+' every: '+_every+' id:'+_id);
    await LocalNotifications.schedule(
      {
        notifications: [
          {
            title: 'Toma de '+medicamentoNombre,
            body: 'Notifique que tomó la medicación',
            id: _id,
            extra: {
              data: 'Pass data to your handler'
            },
            iconColor: '#0000FF',
            schedule: {
              at: new Date(intervalo),
              repeats: true,
              every: _every
            }
          }
        ]
      }
    );

    /*

     LocalNotifications.schedule({
        notifications:[
          {
              title : title,
              body : text,
              id : id
          }
        ]
      });

    */
  }



}
