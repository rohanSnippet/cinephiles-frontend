import Swal from 'sweetalert2';

// Toast for small, non-intrusive messages (Top Right)
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

// Center big alert for more info/forms/confirmations
export const Alert = Swal.mixin({
  // Global CSS in index.css handles the dark theme colors
});
