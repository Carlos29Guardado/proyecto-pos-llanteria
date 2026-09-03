import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ClienteService } from '../services/cliente.service';
import { AlertasService } from '../services/alertas.service';
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClienteComponent implements OnInit {
  // Arreglo para almacenar la lista de usuarios que viene de la base de datos
  listaClientes: any[] = [];

  // Objeto que controla los datos del formulario (Sirve para crear o editar)
  clienteActual = {
    _id: null,
    nombre: '',
    apellido: '',
    telefono: '',
    dui: ''
  };

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private alertasService: AlertasService
  ) { }

  // Este método se ejecuta automáticamente al cargar la pantalla
  ngOnInit(): void {
    this.obtenerClientes();
  }

  //MÉTODO PARA OBTENER LOS CLIENTES
   obtenerClientes() {
    this.clienteService.obtenerCliente().subscribe({
      next: (res: any) => { 
        this.ngZone.run(() => {
          this.listaClientes = res.clientes || res; 
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.error("Error al obtener clientes:", err)
    });
  }

  //MÉTODO PARA CREAR O ACTUALIZAR UN CLIENTE
  guardarCliente() {
    // Si el usuario tiene un ID, significa que estamos EDITANDO
    if (this.clienteActual._id) {
      this.clienteService.actualizarCliente(this.clienteActual._id, this.clienteActual).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('!Cliente actualizado!');
          this.obtenerClientes();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error("Error al actualizar:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al actualizar el cliente en la base de datos');
        }
      });
    }
    // Si no tiene ID, significa que es un usuario NUEVO
    else {

      const clienteLimpio = {
        nombre: this.clienteActual.nombre,
        apellido: this.clienteActual.apellido,
        telefono: this.clienteActual.telefono,
        dui: this.clienteActual.dui
      };

      this.clienteService.crearCliente(clienteLimpio).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('!Cliente guardado!');
          this.obtenerClientes(); // Recargamos la tabla en vivo
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error("Error al crear:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al guardar el cliente en la base de datos');
        }
      });
    }
  }
  // MÉTODO PARA LLENAR EL FORMULARIO CUANDO LE DAS A "EDITAR"
  cargarDatosEdicion(cliente: any) {
    this.clienteActual = { ...cliente };
  }

  // MÉTODO PARA ELIMINAR 
  eliminarCliente(id: string) {
    // Llamamos al servicio de alertas para pedir confirmación
    this.alertasService.confirmarEliminacion("Esta acción borrará el cliente permanentemente.").then((confirmado) => {

      // Si el usuario hizo clic en "Sí, eliminar"
      if (confirmado) {
        this.clienteService.eliminarCliente(id).subscribe({
          next: (res: any) => {
            console.log("Respuesta exitosa al eliminar:", res);
            
            // Mostramos la alerta flotante de éxito
            this.alertasService.mostrarExito('¡Empleado eliminado!');
            this.obtenerClientes();
          },
          error: (error) => {
            console.error("Error al eliminar:", error);
            // Mostramos alerta de error si algo falla en el backend
            this.alertasService.mostrarError('Hubo un error al intentar eliminar el cliente');
          }
        });
      }

    });
  }


  limpiarFormulario() {
    this.clienteActual = {
      _id: null,
      nombre: '',
      apellido: '',
      telefono: '',
      dui: ''
    };
  }
}