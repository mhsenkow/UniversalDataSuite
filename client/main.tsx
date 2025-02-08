import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryBuilder } from './src/components/QueryBuilder/QueryBuilder';
import { DataSource } from './src/components/DataSource/DataSource';
import { QueryCondition } from './src/types';
import { VegaChart } from './src/components/Visualizations/VegaChart';

// Import styles in the correct order
import './src/index.css';  // Global styles first
import './src/components/DataSource/DataSource.css';  // Component styles second
import './src/test.css';   // Test styles last

const App = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setFilteredData(newData);
  };

  const handleQueryChange = (query: QueryCondition[]) => {
    // Limit the number of items we filter at once
    const maxFilterItems = 1000;
    const dataToFilter = data.slice(0, maxFilterItems);
    
    const filtered = dataToFilter.filter(item => {
      return query.every(condition => {
        const value = item[condition.field];
        if (value === undefined || value === null) return false;
        
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
          case 'greater_than':
            return Number(value) > Number(condition.value);
          case 'less_than':
            return Number(value) < Number(condition.value);
          case 'between':
            const range = JSON.parse(condition.value);
            return Number(value) >= Number(range.min) && Number(value) <= Number(range.max);
          default:
            return true;
        }
      });
    });
    
    setFilteredData(filtered);
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <DataSource onDataChange={handleDataChange} />
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