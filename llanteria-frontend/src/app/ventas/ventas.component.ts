import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../services/ventas.service';
import { ProductoService } from '../services/producto.service';
import { ClienteService} from '../services/cliente.service'
import { AlertasService } from '../services/alertas.service';
import { FacturaDocumentoComponent, FacturaVista } from './factura-documento.component';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, FacturaDocumentoComponent],
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
  detalles: { producto: string, nombre: string, cantidad: number, precio: number }[] = [];

  // Variables temporales para el input antes de agregar a la lista
  productoIdTemp: string = '';
  cantidadTemp: number = 1;

  // Factura en curso y factura del historial abierta en el modal
  borrador: FacturaVista = this.crearBorrador();
  facturaAbierta: FacturaVista | null = null;

  // Evita cobrar dos veces con doble clic
  procesando = false;

  constructor(
    private ventasService: VentasService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef,
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
        const data = res.productos || res.data || res;
        this.listaProductos = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Error al cargar llantas", err)
    });
  }
 // MÉTODO PARA OBTENER CLIENTES
  obtenerClientes() {
    this.clienteService.obtenerCliente().subscribe({
      next: (res: any) => {
        const data = res.clientes || res.usuarios || res.data || res;
        this.listaClientes = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Error al cargar clientes", err)
    });
  }

  // MÉTODO PARA OBTENER EL HISTORIAL DE VENTAS
  obtenerVentas() {
    this.ventasService.obtenerVenta().subscribe({
      next: (res: any) => {
        this.listaVentas = res.ventas || res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Error al obtener ventas:", err)
    });
  }

  agregarAlCarrito() {
    const llanta = this.listaProductos.find(p => p._id === this.productoIdTemp);
    if (!llanta || !Number.isInteger(this.cantidadTemp) || this.cantidadTemp < 1) {
      this.alertasService.mostrarError('Selecciona una llanta y cantidad válida');
      return;
    }

    // Si la llanta ya está en el carrito se suma a la misma línea
    const enCarrito = this.detalles.find(d => d.producto === llanta._id);
    const cantidadTotal = (enCarrito?.cantidad ?? 0) + this.cantidadTemp;
    if (cantidadTotal > llanta.stock) {
      this.alertasService.mostrarError(`Solo hay ${llanta.stock} unidades disponibles de esta llanta`);
      return;
    }

    if (enCarrito) {
      enCarrito.cantidad = cantidadTotal;
    } else {
      this.detalles.push({
        producto: llanta._id,
        nombre: `${llanta.marca} ${llanta.descripcion}`,
        cantidad: this.cantidadTemp,
        precio: llanta.precio
      });
    }

    this.productoIdTemp = '';
    this.cantidadTemp = 1;
    this.actualizarBorrador();
  }

  // MÉTODO PARA QUITAR UN PRODUCTO DEL CARRITO
  eliminarDelCarrito(index: number) {
    this.detalles.splice(index, 1);
    this.actualizarBorrador();
  }

  // MÉTODO PARA CREAR LA VENTA (COBRAR)
  procesarVenta() {
    if (!this.cliente || this.detalles.length === 0) {
      this.alertasService.mostrarError('Ingresa el cliente y al menos un producto.');
      return;
    }
    if (this.procesando) return;
    this.procesando = true;

    // El precio lo calcula el backend, solo se envía qué se vende y cuánto
    const nuevaVenta = {
      cliente: this.cliente,
      detalles: this.detalles.map(({ producto, cantidad }) => ({ producto, cantidad }))
    };

    this.ventasService.crearVenta(nuevaVenta).subscribe({
      next: (res: any) => {
        this.procesando = false;
        this.alertasService.mostrarExito(`¡Venta completada! Total: $${res.venta.total_venta.toFixed(2)}`);
        this.limpiarFormulario();
        this.obtenerVentas();
        this.obtenerProductos();
      },
      error: (err: any) => {
        this.procesando = false;
        this.cdr.detectChanges();
        console.error("Error al cobrar:", err);
        this.alertasService.mostrarError(err.error?.mensaje || 'Error al registrar la venta en la base de datos');
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
            this.obtenerProductos();
          },
          error: (err: any) => {
            console.error("Error al anular:", err);
            this.alertasService.mostrarError(err.error?.mensaje || 'Hubo un error al intentar anular la venta');
          }
        });
      }
    });
  }

  // MÉTODOS PARA VER E IMPRIMIR UNA FACTURA DEL HISTORIAL
  verFactura(venta: any) {
    this.facturaAbierta = {
      numero: this.numeroFactura(venta),
      fecha: venta.createdAt,
      cliente: this.nombreCliente(venta.cliente),
      dui: venta.cliente?.dui ?? '',
      lineas: venta.detalles.map((item: any) => ({
        descripcion: this.nombreProducto(item),
        cantidad: item.cantidad,
        precio: item.precio_unitario
      })),
      total: venta.total_venta,
      estado: venta.estado
    };
  }

  @HostListener('document:keydown.escape')
  cerrarFactura() {
    this.facturaAbierta = null;
  }

  imprimirFactura() {
    window.print();
  }

  // Número corto y legible a partir del ID de la venta
  numeroFactura(venta: any): string {
    return venta._id.slice(-6).toUpperCase();
  }

  // El cliente o el producto pueden venir vacíos si se eliminaron después de la venta
  nombreCliente(cliente: any): string {
    return cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : 'Cliente eliminado';
  }

  nombreProducto(item: any): string {
    return item.producto ? `${item.producto.marca} ${item.producto.descripcion}` : 'Producto eliminado';
  }

  // Mantiene la vista previa de la factura al día con el formulario
  actualizarBorrador() {
    this.borrador = this.crearBorrador();
  }

  private crearBorrador(): FacturaVista {
    const clienteSeleccionado = this.listaClientes.find(c => c._id === this.cliente);
    return {
      numero: null,
      fecha: new Date(),
      cliente: clienteSeleccionado ? this.nombreCliente(clienteSeleccionado) : '',
      dui: clienteSeleccionado?.dui ?? '',
      lineas: this.detalles.map(d => ({ descripcion: d.nombre, cantidad: d.cantidad, precio: d.precio })),
      total: this.detalles.reduce((suma, d) => suma + d.cantidad * d.precio, 0),
      estado: 'Completada'
    };
  }

  // MÉTODO PARA VACIAR LA CAJA PARA EL SIGUIENTE CLIENTE
  limpiarFormulario() {
    this.cliente = '';
    this.detalles = [];
    this.productoIdTemp = '';
    this.cantidadTemp = 1;
    this.actualizarBorrador();
  }
}
