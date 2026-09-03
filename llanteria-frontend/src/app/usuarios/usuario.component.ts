import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UsuarioService } from '../services/usuario.service';
import { AlertasService } from '../services/alertas.service';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class Usuarios implements OnInit {
  // Arreglo para almacenar la lista de usuarios que viene de la base de datos
  listaUsuarios: any[] = [];
  
  // Objeto que controla los datos del formulario (Sirve para crear o editar)
  usuarioActual = {
    _id: null,
    nombre: '',
    correo: '',
    password: '',
    rol: 'CAJERO' 
  };

  constructor(
    private usuarioService: UsuarioService, 
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private alertasService: AlertasService
  ) {}

  // Este método se ejecuta automáticamente al cargar la pantalla
  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  //MÉTODO PARA OBTENER LOS USUARIOS
  obtenerUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.listaUsuarios = res.usuarios || res; 
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.error("Error al obtener usuarios:", err)
    });
  }

  //MÉTODO PARA CREAR O ACTUALIZAR UN USUARIO
 guardarUsuario() {
    // Si el usuario tiene un ID, significa que estamos EDITANDO
    if (this.usuarioActual._id) {
      this.usuarioService.actualizarUsuario(this.usuarioActual._id, this.usuarioActual).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('¡Usuario actualizado!');
          this.obtenerUsuarios(); 
          this.limpiarFormulario(); 
        },
        error: (err: any) => {
          console.error("Error al actualizar:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al actualizar el usuario en la base de datos');
        }
      });
    } 
    // Si no tiene ID, significa que es un usuario NUEVO
    else {
      
      const usuarioLimpio = {
        nombre: this.usuarioActual.nombre,
        correo: this.usuarioActual.correo,
        password: this.usuarioActual.password,
        rol: this.usuarioActual.rol
      };
      
      this.usuarioService.crearUsuario(usuarioLimpio).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('¡Usuario guardado!');
          this.obtenerUsuarios(); // Recargamos la tabla en vivo
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error("Error al crear:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al guardar el usuario en la base de datos');
        }
      });
    }
  }
  // MÉTODO PARA LLENAR EL FORMULARIO CUANDO LE DAS A "EDITAR"
  cargarDatosEdicion(usuario: any) {
    this.usuarioActual = { ...usuario };
  }

  // MÉTODO PARA ELIMINAR 
eliminarUsuario(id: string) {
    // Llamamos al servicio de alertas para pedir confirmación
    this.alertasService.confirmarEliminacion("Esta acción borrará al empleado permanentemente.").then((confirmado) => {
      
      // Si el usuario hizo clic en "Sí, eliminar"
      if (confirmado) {
        this.usuarioService.eliminarUsuario(id).subscribe({
          next: () => {
            // Mostramos la alerta flotante de éxito
            this.alertasService.mostrarExito('¡Empleado eliminado!');
            this.obtenerUsuarios(); // Refresca la tabla automáticamente al borrar
          },
          error: (error) => {
            console.error("Error al eliminar:", error);
            // Mostramos alerta de error si algo falla en el backend
            this.alertasService.mostrarError('Hubo un error al intentar eliminar al empleado');
          }
        });
      }

    });
  }


  limpiarFormulario() {
    this.usuarioActual = {
      _id: null,
      nombre: '',
      correo: '',
      password: '',
      rol: 'CAJERO'
    };
  }
}