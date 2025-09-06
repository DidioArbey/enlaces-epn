// src/utils/notifications.js
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// 🎨 Configuración de toast
export const toastConfig = {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
};

// 🔔 Funciones de notificación toast
export const notify = {
    success: (message) => toast.success(message, toastConfig),
    error: (message) => toast.error(message, toastConfig),
    warning: (message) => toast.warning(message, toastConfig),
    info: (message) => toast.info(message, toastConfig),
    loading: (message) => toast.loading(message, toastConfig)
};

// 🍭 Configuración de SweetAlert2
export const swalConfig = {
    customClass: {
        container: 'swal-enlaces-epn',
        popup: 'swal-popup',
        title: 'swal-title',
        content: 'swal-content',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
    },
    buttonsStyling: false
};

// 🎭 Funciones de SweetAlert2
export const swalAlert = {
    // ✅ Confirmación exitosa
    success: (title, text = '') => {
        return Swal.fire({
            ...swalConfig,
            icon: 'success',
            title,
            text,
            confirmButtonText: 'Entendido',
            timer: 3000
        });
    },

    // ❌ Error
    error: (title, text = '') => {
        return Swal.fire({
            ...swalConfig,
            icon: 'error',
            title,
            text,
            confirmButtonText: 'Cerrar'
        });
    },

    // ⚠️ Advertencia
    warning: (title, text = '') => {
        return Swal.fire({
            ...swalConfig,
            icon: 'warning',
            title,
            text,
            confirmButtonText: 'Entendido'
        });
    },

    // ❓ Confirmación
    confirm: (title, text = '', confirmText = 'Confirmar', cancelText = 'Cancelar') => {
        return Swal.fire({
            ...swalConfig,
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true
        });
    },

    // 🗑️ Confirmar eliminación
    delete: (title = '¿Estás seguro?', text = 'Esta acción no se puede deshacer') => {
        return Swal.fire({
            ...swalConfig,
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            reverseButtons: true
        });
    },

    // 📝 Input
    input: (title, placeholder = '', inputType = 'text') => {
        return Swal.fire({
            ...swalConfig,
            title,
            input: inputType,
            inputPlaceholder: placeholder,
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Este campo es requerido';
                }
            }
        });
    },

    // ⏳ Loading
    loading: (title = 'Procesando...', text = 'Por favor espera') => {
        return Swal.fire({
            ...swalConfig,
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
};

// 🎨 Estilos personalizados para SweetAlert2
export const swalStyles = `
  .swal-enlaces-epn .swal-popup {
    border-radius: 12px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  }
  
  .swal-enlaces-epn .swal-title {
    color: #1e40af !important;
    font-weight: 600 !important;
  }
  
  .swal-enlaces-epn .swal-content {
    color: #374151 !important;
  }
  
  .swal-enlaces-epn .swal-confirm-btn {
    background-color: #1e40af !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
  }
  
  .swal-enlaces-epn .swal-confirm-btn:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-1px) !important;
  }
  
  .swal-enlaces-epn .swal-cancel-btn {
    background-color: #6b7280 !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
    font-weight: 500 !important;
    margin-right: 12px !important;
  }
  
  .swal-enlaces-epn .swal-cancel-btn:hover {
    background-color: #4b5563 !important;
  }
`;