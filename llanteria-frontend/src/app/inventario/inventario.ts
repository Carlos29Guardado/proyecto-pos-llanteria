import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductoService } from '../services/producto';
import { AlertasService } from '../services/alertas.service';


interface Producto {
  _id?: string,
  codigo: string;
  descripcion: string;
  marca: string;
  stock: number | string;
  precio: number;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  idEditando: string | null = null;
  nuevoCodigo: string = '';
  nuevaDesc: string = '';
  nuevaMarca: string = '';
  nuevoStock: number | string = '';
  nuevoPrecio: number | string = '';

 
  productos: Producto[] = [];
  constructor(
    private productoService: ProductoService, 
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private alertasService: AlertasService
  ) { }

  // Se ejecuta al cargar el componente
  ngOnInit(): void {
    this.obtenerProductos();
  }

  //MÉTODO PARA OBTENER EL INVENTARIO
  obtenerProductos() {
    this.productoService.obtenerLlanta().subscribe({
      next: (respuesta: any) => {
        // Obligamos a Angular a actualizar la tabla dentro de su zona de detección
        this.ngZone.run(() => {
          this.productos = respuesta.productos;
          this.cdr.detectChanges(); // Forzamos el redibujado instantáneo
        });
      },
      error: (err) => {
        console.error("Error al cargar las llantas:", err);
      }
    });
  }

eliminarProducto(id: string) {
    // Llamamos al servicio global para pedir confirmación
    this.alertasService.confirmarEliminacion("Esta acción borrará el producto permanentemente.").then((confirmado) => {
      
      // Si el usuario confirmó el borrado
      if (confirmado) {
        this.productoService.eliminarLlanta(id).subscribe({
          next: () => {
            // Usamos el servicio global para mostrar el éxito
            this.alertasService.mostrarExito('¡Producto eliminado!');
            this.obtenerProductos(); 
          },
          error: (err) => {
            console.error('Error al eliminar', err);
            // Usamos el servicio global para mostrar el error
            this.alertasService.mostrarError('Error al intentar eliminar el producto de la base de datos');
          }
        });
      }

    });
  }

 // MÉTODO PARA AGREGAR O EDITAR UN PRODUCTO USANDO EL SERVICIO GLOBAL
  agregarProducto() {
    if (this.nuevoCodigo && this.nuevaDesc) {
      const nuevaLlanta = {
        codigo: this.nuevoCodigo,
        descripcion: this.nuevaDesc,
        marca: this.nuevaMarca,
        stock: String(this.nuevoStock),
        precio: Number(this.nuevoPrecio)
      };

      // Si hay un ID en edición, ACTUALIZAMOS
      if (this.idEditando) {
        this.productoService.actualizarLlanta(this.idEditando, nuevaLlanta).subscribe({
          next: () => {
            // Usamos el servicio global para el éxito
            this.alertasService.mostrarExito('¡Producto actualizado!');
            this.obtenerProductos(); 
            this.limpiarFormulario();
          },
          error: (err) => {
            console.error('Error al actualizar', err);
            // Agregamos la alerta de error global
            this.alertasService.mostrarError('Error al actualizar el producto en la base de datos');
          }
        });
      } 
      // Si no hay ID, GUARDAMOS UNO NUEVO
      else {
        this.productoService.guardarLlanta(nuevaLlanta).subscribe({
          next: () => {
            // Usamos el servicio global para el éxito
            this.alertasService.mostrarExito('¡Producto guardado!');
            this.obtenerProductos(); 
            this.limpiarFormulario(); 
          },
          error: (err) => {
            console.error('Error:', err);
            // Usamos el servicio global para el error (reemplazando el Swal.fire directo)
            this.alertasService.mostrarError('Error al guardar en la base de datos');
          }
        });
      }
    }
  }

  // MÉTODO PARA LLENAR EL FORMULARIO AL PRESIONAR "EDITAR"
  cargarDatosEdicion(llanta: Producto) {
    this.idEditando = llanta._id!;
    this.nuevoCodigo = llanta.codigo;
    this.nuevaDesc = llanta.descripcion;
    this.nuevaMarca = llanta.marca;
    this.nuevoStock = llanta.stock;
    this.nuevoPrecio = llanta.precio;
  }

  // MÉTODO PARA VACIAR EL FORMULARIO DESPUÉS DE GUARDAR
  limpiarFormulario() {
    this.idEditando = null;
    this.nuevoCodigo = '';
    this.nuevaDesc = '';
    this.nuevaMarca = '';
    this.nuevoStock = '';
    this.nuevoPrecio = '';
  }

}
