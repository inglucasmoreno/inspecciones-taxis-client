import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { InspeccionesService } from 'src/app/services/inspecciones.service';

@Component({
  selector: 'app-inspecciones',
  templateUrl: './inspecciones.component.html',
  styles: [
  ]
})
export class InspeccionesComponent implements OnInit {

  // Modal
  public showModalInspeccion = false;
  public showModalDetalles = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Inspecciones
  public idInspeccion: string = '';
  public inspecciones: any[] = [];
  public inspeccionSeleccionada: any;
  
  // Formulario
  public inspeccion: string = '';
  public nro_licencia: string = '';

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private inspeccionesService: InspeccionesService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Inspecciones'; 
    this.alertService.loading();
    this.listarInspecciones(); 
  }

  // Abrir modal
  abrirModal(estado: string, inspeccion: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.inspeccion = '';
    this.idInspeccion = '';
    
    if(estado === 'editar') this.getInspeccion(inspeccion);
    else this.showModalInspeccion = true;
  
    this.estadoFormulario = estado;  
  }

  // Traer datos de inspeccion
  getInspeccion(inspecciones: any): void {
    this.alertService.loading();
    this.idInspeccion = inspecciones._id;
    this.inspeccionesService.getInspeccion(inspecciones._id).subscribe(({inspeccion}) => {
      this.inspeccion = inspeccion.inspeccion;
      this.alertService.close();
      this.showModalInspeccion = true;
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar inspecciones
  listarInspecciones(): void {
    this.inspeccionesService.listarInspecciones( 
      this.ordenar.direccion,
      this.ordenar.columna
      )
    .subscribe( ({ inspecciones }) => {
      this.inspecciones = inspecciones;
      this.showModalInspeccion = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo inspeccion
  nuevaInspeccion(): void {

    // Verificacion: Nro de licencia
    if(this.inspeccion.trim() === ""){
      this.alertService.info('Debes colocar un número de licencia');
      return;
    }

    // Verificacion: Observacion vacia
    if(this.nro_licencia.trim() === ""){
      this.alertService.info('Debes colocar un resultado');
      return;
    }

    const data = {
      nro_licencia: this.nro_licencia,
      inspeccion: this.inspeccion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.alertService.loading();
    this.inspeccionesService.nuevaInspeccion(data).subscribe(() => {
      this.listarInspecciones();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar inspeccion
  actualizarInspeccion(): void {

    // Verificacion: Descripción vacia
    if(this.inspeccion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();
    this.inspeccionesService.actualizarInspeccion(this.idInspeccion, { descripcion: this.inspeccion.toLocaleUpperCase() }).subscribe(() => {
      this.listarInspecciones();
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(inspeccion: any): void {
    
    const { _id, activo } = inspeccion;
    
    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.inspeccionesService.actualizarInspeccion(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarInspecciones();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });

  }

  abrirDetalles(inspeccion: any): void {
    this.inspeccionSeleccionada = inspeccion;
    this.showModalDetalles = true;    
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.inspeccion = '';  
    this.nro_licencia = '';
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.listarInspecciones();
  }

}
