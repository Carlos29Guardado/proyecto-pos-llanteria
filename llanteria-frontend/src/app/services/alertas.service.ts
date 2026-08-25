import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
    providedIn: 'root'
})
export class AlertasService{
    constructor(){ }

    // METODO GLOBAL PARA MENSAJES DE EXITO
    mostrarExito(mensaje: string){
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon:'success',
            title: mensaje,
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    }
    // MÉTODO GLOBAL PARA CONFIRMAR ELIMINACION
    confirmarEliminacion(mensaje: string): Promise<boolean> {
        return Swal.fire({
            title: '¿Estás seguro?',
            text: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            return result.isConfirmed;
        });
    }
    // MÉTODO GLOBAL PARA ERRORES
    mostrarError(mensaje: string) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: mensaje
        });
    }
}