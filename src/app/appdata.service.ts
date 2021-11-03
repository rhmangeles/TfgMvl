import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppdataService {

  medicamentos = [];

  constructor() { }

  setMedicamentos(med) {
    this.medicamentos = med;
  }

  getMedicamentos() {
    return this.medicamentos;
  }
}
