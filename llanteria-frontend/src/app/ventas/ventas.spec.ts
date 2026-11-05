import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AlertasService } from '../services/alertas.service';
import { VentasComponent } from './ventas.component';

describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;

  const llanta = { _id: 'p1', marca: 'Michelin', descripcion: 'Todoterreno', precio: 50.5, stock: 4 };

  const agregar = (cantidad: number) => {
    component.productoIdTemp = llanta._id;
    component.cantidadTemp = cantidad;
    component.agregarAlCarrito();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    component.listaProductos = [llanta];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('une en una sola línea la misma llanta y calcula el total', () => {
    agregar(3);
    agregar(1);

    expect(component.detalles.length).toBe(1);
    expect(component.borrador.lineas[0].cantidad).toBe(4);
    expect(component.borrador.total).toBe(202);
  });

  it('no deja agregar más unidades que el stock disponible', () => {
    const mostrarError = vi.spyOn(TestBed.inject(AlertasService), 'mostrarError').mockImplementation(() => {});

    agregar(3);
    agregar(2);

    expect(component.detalles[0].cantidad).toBe(3);
    expect(mostrarError).toHaveBeenCalledWith('Solo hay 4 unidades disponibles de esta llanta');
  });

  it('arma la factura del historial aunque el producto ya no exista', () => {
    component.verFactura({
      _id: '65a1b2c3d4e5f60718293a4b',
      createdAt: '2026-11-05T12:00:00Z',
      cliente: { nombre: 'Ana', apellido: 'Pérez', dui: '01234567-8' },
      detalles: [{ producto: null, cantidad: 2, precio_unitario: 10 }],
      total_venta: 20,
      estado: 'Completada',
    });

    expect(component.facturaAbierta?.numero).toBe('293A4B');
    expect(component.facturaAbierta?.cliente).toBe('Ana Pérez');
    expect(component.facturaAbierta?.lineas[0].descripcion).toBe('Producto eliminado');
  });
});
