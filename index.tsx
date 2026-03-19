
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AdminViewProvider } from './common/context/AdminViewContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminViewProvider>
      <App />
    </AdminViewProvider>
  </React.StrictMode>
);
