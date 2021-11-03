import { Component, OnInit } from '@angular/core';
import { AppdataService } from '../appdata.service';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
})
export class MedicamentosPage implements OnInit {

  // Medicamentos
  medicamentos:any = [];

  constructor(private appDataService: AppdataService) {
    this.medicamentos = appDataService.getMedicamentos();
  }

  ngOnInit() {
  }

}
