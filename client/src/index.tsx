import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/DataSource/DataSource';

// Import styles in the correct order
import './index.css';  // Global styles first
import './components/DataSource/DataSource.css';  // Component styles second
import './test.css';   // Test styles last

// ... other imports

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); 