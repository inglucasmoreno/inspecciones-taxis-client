import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class InspeccionesService {

  constructor(private http: HttpClient) { }

  // Inspeccion por ID
  getInspeccion(id: string): Observable<any> {
    return this.http.get(`${base_url}/inspeccion/${id}`,{
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

  // Listar inspecciones
  listarInspecciones(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/inspeccion`,{
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {'Authorization': localStorage.getItem('token') }   
    });
  }

  // Nueva inpseccion
  nuevaInspeccion(data: any): Observable<any> {
    return this.http.post(`${base_url}/inspeccion`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });  
  }

  // Actualizar inspeccion
  actualizarInspeccion(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/inspeccion/${id}`, data, {
      headers: {'Authorization': localStorage.getItem('token')}
    });
  }

}
