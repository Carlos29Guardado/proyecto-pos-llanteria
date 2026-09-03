import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../services/ventas.service';
import { ProductoService } from '../services/producto.service';
import { ClienteService} from '../services/cliente.service'
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  // Arreglo para almacenar el historial de ventas
  listaVentas: any[] = [];
  listaProductos: any[] = [];
  listaClientes: any[] = [];

  // Variables para controlar el carrito de caja
  cliente: string = '';
  detalles: { producto: string, nombre: string, cantidad: number }[] = [];

  // Variables temporales para el input antes de agregar a la lista
  productoIdTemp: string = '';
  cantidadTemp: number = 1;

  constructor(
    private ventasService: VentasService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private alertasService: AlertasService
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
    this.obtenerProductos();
    this.obtenerClientes();
  }

  // MÉTODO PARA OBTENER PRODUCTOS
  obtenerProductos() {
    this.productoService.obtenerProducto().subscribe({
      next: (res: any) => {
        console.log("Respuesta cruda de Productos:", res);
        const data = res.productos || res.data || res;
        this.listaProductos = Array.isArray(data) ? data : [];
      },
      error: (err: any) => console.error("Error al cargar llantas", err)
    });
  }
 // MÉTODO PARA OBTENER CLIENTES
  obtenerClientes() {
    this.clienteService.obtenerCliente().subscribe({
      next: (res: any) => {
        console.log("Respuesta cruda de Clientes:", res);
        const data = res.clientes || res.usuarios || res.data || res;
        this.listaClientes = Array.isArray(data) ? data : [];
      },
      error: (err: any) => console.error("Error al cargar clientes", err)
    });
  }

  // MÉTODO PARA OBTENER EL HISTORIAL DE VENTAS
  obtenerVentas() {
    this.ventasService.obtenerVenta().subscribe({
    next: (res: any) => {
      this.ngZone.run(() => {
        this.listaVentas = res.ventas || res;
        this.cdr.detectChanges();
      });
    },
    error: (err: any) => console.error("Error al obtener inventario:", err)
  });
}

  agregarAlCarrito() {
    if (this.productoIdTemp && this.cantidadTemp > 0) {
      
      // Buscamos la llanta seleccionada para sacar su nombre/marca
      const llanta = this.listaProductos.find(p => p._id === this.productoIdTemp);
      const nombreVisual = llanta ? `${llanta.marca} ${llanta.modelo}` : 'Llanta Genérica';

      this.detalles.push({
        producto: this.productoIdTemp, 
        nombre: nombreVisual,         
        cantidad: this.cantidadTemp
      });
      
      this.productoIdTemp = '';
      this.cantidadTemp = 1;
    } else {
      this.alertasService.mostrarError('Selecciona una llanta y cantidad válida');
    }
  }

  // MÉTODO PARA QUITAR UN ERROR DEL CARRITO
  eliminarDelCarrito(index: number) {
    this.detalles.splice(index, 1);
  }

  // MÉTODO PARA CREAR LA VENTA (COBRAR)
  procesarVenta() {
    if (!this.cliente || this.detalles.length === 0) {
      this.alertasService.mostrarError('Ingresa el cliente y al menos un producto.');
      return;
    }

    const nuevaVenta = {
      cliente: this.cliente,
      detalles: this.detalles
    };

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: (res: any) => {
        this.alertasService.mostrarExito(`¡Venta completada! Total: $${res.venta.total_venta}`);
        this.obtenerVentas(); 
        this.limpiarFormulario();
      },
      error: (err: any) => {
        console.error("Error al cobrar:", err);
        this.alertasService.mostrarError('Error al registrar la venta en la base de datos');
      }
    });
  }

  // MÉTODO PARA ANULAR VENTA (Reemplaza la eliminación física)
  anularVenta(id: string) {
    this.alertasService.confirmarEliminacion("Esta acción anulará la factura y devolverá las llantas al inventario.").then((confirmado) => {
      
      if (confirmado) {
        this.ventasService.anularVenta(id).subscribe({
          next: () => {
            this.alertasService.mostrarExito('¡Venta anulada correctamente!');
            this.obtenerVentas(); 
          },
          error: (err: any) => {
            console.error("Error al anular:", err);
            this.alertasService.mostrarError('Hubo un error al intentar anular la venta');
          }
        });
      }
    });
  }

  // MÉTODO PARA VACIAR LA CAJA PARA EL SIGUIENTE CLIENTE
  limpiarFormulario() {
    this.cliente = '';
    this.detalles = [];
    this.productoIdTemp = '';
    this.cantidadTemp = 1;
  }
}