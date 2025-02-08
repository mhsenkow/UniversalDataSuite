import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryBuilder } from './components/QueryBuilder/QueryBuilder';
import { DataSource } from './components/DataSource/DataSource';
import { QueryCondition } from './types';
import { VegaChart } from './components/Visualizations/VegaChart';

// Import styles in the correct order
import './index.css';  // Global styles only
import './components/DataSource/DataSource.css';  // Component styles

const App = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <DataSource onDataChange={() => {}} />
      </div>
      <footer className="app-footer">
        <h1 className="app-title">Jacklyn Domino</h1>
      </footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 