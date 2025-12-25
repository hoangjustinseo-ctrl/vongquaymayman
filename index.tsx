
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim đơn giản cho process nếu môi trường không cung cấp
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Lỗi khởi tạo React:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: white; text-align: center;">
      <h2>Đã xảy ra lỗi khởi tạo ứng dụng</h2>
      <p>${error instanceof Error ? error.message : 'Vui lòng tải lại trang'}</p>
    </div>`;
  }
}
