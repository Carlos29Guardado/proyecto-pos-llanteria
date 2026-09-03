import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductoService } from '../services/producto.service';
import { AlertasService } from '../services/alertas.service';
@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // Arreglo para almacenar la lista de inventario que viene de la base de datos
  listaInventario: any[] = [];

  // Objeto que controla los datos del formulario (Sirve para crear o editar)
  productoActual = {
    _id: null,
    codigo: '',
    descripcion: '',
    marca: '',
    stock: '',
    precio: ''
  };

  constructor(
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private alertasService: AlertasService
  ) { }

  // Este método se ejecuta automáticamente al cargar la pantalla
  ngOnInit(): void {
    this.obtenerProductos();
  }

  //MÉTODO PARA OBTENER LOS inventario
  obtenerProductos() {
    this.productoService.obtenerProducto().subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.listaInventario = res.productos || res;
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => console.error("Error al obtener inventario:", err)
    });
  }

  //MÉTODO PARA CREAR O ACTUALIZAR
  guardarProducto() {
    // Si el prducto tiene un ID, significa que estamos EDITANDO
    if (this.productoActual._id) {
      this.productoService.actualizarProducto(this.productoActual._id, this.productoActual).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('!Producto actualizado!');
          this.obtenerProductos();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error("Error al actualizar:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al actualizar el producto en la base de datos');
        }
      });
    }
    // Si no tiene ID, significa que es un producto NUEVO
    else {

      const productoLimpio = {
        codigo: this.productoActual.codigo,
        descripcion: this.productoActual.descripcion,
        marca: this.productoActual.marca,
        stock: this.productoActual.stock,
        precio: this.productoActual.precio
      };

      this.productoService.crearProducto(productoLimpio).subscribe({
        next: () => {
          // Usamos el servicio global para el éxito
          this.alertasService.mostrarExito('Producto guardado!');
          this.obtenerProductos();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error("Error al crear:", err);
          // Usamos el servicio global para el error
          this.alertasService.mostrarError('Error al guardar el producto en la base de datos');
        }
      });
    }
  }
  // MÉTODO PARA LLENAR EL FORMULARIO CUANDO LE DAS A "EDITAR"
  cargarDatosEdicion(producto: any) {
    this.productoActual = { ...producto };
  }

  // MÉTODO PARA ELIMINAR 
  eliminarProducto(id: string) {
    // Llamamos al servicio de alertas para pedir confirmación
    this.alertasService.confirmarEliminacion("Esta acción borrará el producto permanentemente.").then((confirmado) => {

      // Si el usuario hizo clic en "Sí, eliminar"
      if (confirmado) {
        this.productoService.eliminarProducto(id).subscribe({
          next: () => {
            // Mostramos la alerta flotante de éxito
            this.alertasService.mostrarExito('Producto eliminado!');
            this.obtenerProductos();
          },
          error: (error) => {
            console.error("Error al eliminar:", error);
            // Mostramos alerta de error si algo falla en el backend
            this.alertasService.mostrarError('Hubo un error al intentar eliminar');
          }
        });
      }

    });
  }


  limpiarFormulario() {
    this.productoActual = {
      _id: null,
      codigo: '',
      descripcion: '',
      marca: '',
      stock: '',
      precio: ''
    };
  }
}