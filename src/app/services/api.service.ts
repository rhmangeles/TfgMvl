import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, HttpHeaders, HttpResponse } from '@capacitor-community/http';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router'
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

const { Storage } = Plugins;

const ACCESS_TOKEN_KEY = 'token_usuario';


@Injectable({
  providedIn: 'root'
})
export class ApiService {


  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken = null; // En el inicio no disponemos de token.
  url = environment.api_url; // Desde environment nos traemos la ruta base de la api.
  
  constructor(private router: Router, private nativeStorage: NativeStorage) { //private http: Http
    this.loadToken(); //Al inicializar cargamos el token.
  }

  /**
   * Si disponemos de token en el almacenamiento seguro lo cogemos desde aqui. 
   * si no pedimos al usuario que vuelva a logarse en la app.
   */
  async loadToken() {
    //const token = await Storage.get({key: ACCESS_TOKEN_KEY });
    /*
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
    */
  }


  // Datos personales del usuario, en el backend actualmente no lo tenemos implementado.
  getSecretData() {
    //return Http.get(`${this.url}/paciente/secret`);
  }

  // Crear un nuevo paciente, actualmente solo dispone de esta funcion los medicos desde el front web de la app.
  //signUp(credentials: {email, password}): Observable<any> {
  // return this.http.post(`${this.url}/pacientes/new`, credentials);
  //}


  // const storeAccess = Storage.set({key: ACCESS_TOKEN_KEY, value: tokens.accessToken});
  // const storeRefresh = Storage.set({key: REFRESH_TOKEN_KEY, value: tokens.refreshToken});
  login(credentials: {email, password}): Observable<any>  { 
    //var headers = new HttpHeaders();
    //headers.append("Accept", 'application/json');
    //headers.append('Content-Type', 'application/json' );
    //headers.append('Access-Control-Allow-Origin', '*');
    //headers.append('Access-Control-Expose-Headers', 'access-control-allow-origin');

    //const httpOptions = { 
    //    headers: headers 
    //}

    //TODO: Hay que modificarlo en el momento que pasemos los datos correspondientes desde el formulario.
    let postData = {
      "email": credentials['email'],
      "password": credentials['password']
    }

    const options = {
      url: `${this.url+'/login'}`,
      data: postData,
      headers: { 'Content-Type': 'application/json' }
    };

    return new Observable(subcriber => {
      Http.request({...options, method: 'POST'}).then(
        async response => {
          if (response.status === 200) {
            const token = response.data['token'];
            console.log("TOken: "+token);
            this.currentAccessToken = token;
            subcriber.next(true);
          } else {
            subcriber.next(false);
          }
        }
      ).catch(e => {
        console.log(e);
      });
    })
    
    
    /*
    return new Observable((subscriber) => {
      this.http.post(this.url + "/login",postData, httpOptions).subscribe(data => {
        let token = data['token'];
        if (token !== '') {
          this.nativeStorage.setItem('token_usuario', {token: token}).then(
            () => {
                    console.log('Token almacenado.');
                  },
            error => console.error('Error guardando token: ', error)
          );
          subscriber.next(true);
        }
        subscriber.next(false); 
      });
    });
    */
    
    /*
    .subscribe(data => {
      let token = data['token'];
      
      if (token !== "") {
        this.nativeStorage.setItem('token_usuario', {token: token}).then(
          () => {
                  console.log('Token almacenado.');
                },
          error => console.error('Error guardando token: ', error)
        );
      }
  
      resolve(data);
    }, error => {
       console.log(error);
    });
    */
  }

  /**
   * Devuelve la lista de medicamentos actuales que se tiene que tomar el paciente.
   */
  getMedicamentosActuales() {
    return new Observable(subcribe => {
      var data = {
        idPaciente: "1"
      }
  
      const options = {
        url: `${this.url+'/medicamentos'}`,
        data: data,
        headers: { 
          'Content-Type'  : 'application/json',
          'Authorization' : 'Bearer '+this.currentAccessToken
        }
      };
      
      // Hacemos peticion post ya que no soporta body en metodo get.
      Http.request({...options, method: 'POST'}).then(medicamentos => {
        console.log("Response Medicamentos ---> "+JSON.stringify(medicamentos));
        subcribe.next(medicamentos['data']['medicamentos']);
      }).catch(error => {
        console.log(error);
        subcribe.next(null);
      });
    });
    }

    /**
     * Envia la notificacion de que el paciente se toma la medicacion.
     */
    envioNotificacionDeToma(idPaciente, idMedicamento){
      //TODO: Hay que implementar el envio por POST con los datos del medicamento y el paciente.
    }
    
    
  }
