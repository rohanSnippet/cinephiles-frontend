export const SwalStyles = `
  .swal-container {
    z-index: 10000;
  }
  .swal-popup {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    overflow: hidden;
  }
  .swal-title {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .swal-progress {
    background: linear-gradient(90deg, #4ade80, #3b82f6);
  }
  .swal2-success-line-tip, .swal2-success-line-long {
    background-color: #4ade80 !important;
  }
  .swal2-success-ring {
    border-color: rgba(74, 222, 128, 0.3) !important;
  }
`;