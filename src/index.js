import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { MapProvider } from './components/Map';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <MapProvider>
      <App />
    </MapProvider>
);
