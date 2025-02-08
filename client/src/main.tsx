import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryBuilder } from './components/QueryBuilder/QueryBuilder';
import { DataSource } from './components/DataSource/DataSource';
import { QueryCondition } from './types';
import { VegaChart } from './components/Visualizations/VegaChart';

const App = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setFilteredData(newData);
  };

  const handleQueryChange = (query: QueryCondition[]) => {
    const filtered = data.filter(item => {
      return query.every(condition => {
        const value = item[condition.field];
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return value.toString().toLowerCase().includes(condition.value.toLowerCase());
          case 'greater_than':
            return value > Number(condition.value);
          case 'less_than':
            return value < Number(condition.value);
          case 'between':
            const range = JSON.parse(condition.value);
            return value >= Number(range.min) && value <= Number(range.max);
          case 'starts_with':
            return value.toString().toLowerCase().startsWith(condition.value.toLowerCase());
          case 'ends_with':
            return value.toString().toLowerCase().endsWith(condition.value.toLowerCase());
          default:
            return true;
        }
      });
    });
    setFilteredData(filtered);
  };

  return (
    <div>
      <h1>Jacklyn Domino</h1>
      <DataSource onDataChange={handleDataChange} />
      <QueryBuilder 
        onQueryChange={handleQueryChange}
        availableFields={data.length ? Object.keys(data[0]) : []}
        fieldTypes={data.length ? Object.keys(data[0]).reduce((types, key) => ({
          ...types,
          [key]: typeof data[0][key]
        }), {}) : {}}
      />
      {filteredData.length > 0 && (
        <>
          <VegaChart 
            data={filteredData}
            fields={data.length ? Object.keys(data[0]).map(key => ({
              name: key,
              type: typeof data[0][key]
            })) : []}
          />
          <div className="data-preview">
            <h2>Data Preview</h2>
            <pre>{JSON.stringify(filteredData, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 