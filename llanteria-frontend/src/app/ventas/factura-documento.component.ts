import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

export interface LineaFactura {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface FacturaVista {
  numero: string | null;
  fecha: Date | string;
  cliente: string;
  dui: string;
  lineas: LineaFactura[];
  total: number;
  estado: string;
}

// Hoja de factura: se usa para la factura en curso y para ver las del historial
@Component({
  selector: 'app-factura-documento',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './factura-documento.component.html',
  styleUrls: ['./factura-documento.component.css']
})
export class FacturaDocumentoComponent {
  @Input({ required: true }) factura!: FacturaVista;
  @Input() editable = false;
  @Output() quitar = new EventEmitter<number>();
}
