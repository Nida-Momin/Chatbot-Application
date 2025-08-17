import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { NhostProvider, NhostClient } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';

import { AuthPage } from './components/AuthPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <BrowserRouter>
          <Routes>
            {/* The /auth route shows the Sign In/Up page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* The / (home) route is protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<App />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>
);