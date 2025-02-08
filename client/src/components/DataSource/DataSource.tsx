import React, { useState, useEffect } from 'react';
import { DataSource as DataSourceType } from '../../types/index';
import Papa from 'papaparse';
import './DataSource.css';
import { DatasetService } from '../../services/DatasetService';
import { DataHealthIndicator } from './DataHealthIndicator';
import birdStrikesData from '../../data/bird-strikes.csv';
import {
  Document,         // For text/string data
  DataStructured,   // For numeric data
  Checkmark,        // For boolean values
  HelpFilled,
  CharacterWholeNumber,
  Switcher,
  CharacterLowerCase,
  Upload,
  ChevronLeft,
  ChevronRight
} from '@carbon/icons-react';
import '../../test.css';
import { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import { VegaChart } from '../VegaChart/VegaChart';
import { ChartOptions } from '../Visualizations/types';

interface DataSourceProps {
  onDataChange: (data: any[]) => void;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  fileName: string;
  totalRows?: number;
  loadedRows?: number;
  error?: string;
}

interface ParsedData {
  [key: string]: any;
}

interface DataSourceOptions {
  maxColumns?: number;
  sampleSize?: number;
  sampleMethod: 'random' | 'frequency' | 'first' | 'distributed';
}

interface QueryCondition {
  field: string;
  operator: string;
  value: string;
}

interface ValueDisplayOptions {
  maxUniqueValues: number;
  sampleSize: number;
  displayMethod: 'random' | 'frequency' | 'first' | 'distributed';
}

// Add a helper function to get the icon for each type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'string':
      return <CharacterLowerCase size={16} />;
    case 'number':
      return <CharacterWholeNumber size={16} />;
    case 'date':
      return <Checkmark size={16} />;
    case 'boolean':
      return <Switcher size={16} />;
    default:
      return <Document size={16} />;
  }
};

// Create a new App wrapper component
export const App: React.FC = () => {
  return (
    <div className="app-container test">
      <div className="main-content">
        <DataSource onDataChange={() => {}} />
      </div>
      <footer className="app-footer">
        <h1 className="app-title">Jacklyn Domino</h1>
      </footer>
    </div>
  );
};

export const DataSource: React.FC<DataSourceProps> = ({ onDataChange }) => {
  const [activeSource, setActiveSource] = useState<DataSourceType | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    fileName: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<DataSourceOptions>({
    maxColumns: 3,
    sampleSize: 1000,
    sampleMethod: 'random'
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    type: 'bar',
    xField: '',
    yField: '',
    aggregation: 'count',
    color: '',
    groupBy: ''
  });
  const [viewOptions, setViewOptions] = useState({
    showChart: true,
    showData: false
  });
  const [preloadedTable, setPreloadedTable] = useState<React.ReactNode>(null);

  // Update the column selector options
  const columnOptions = [
    { value: 'all', label: 'All columns' },
    { value: '3', label: '3 columns' },
    { value: '5', label: '5 columns' },
    { value: '7', label: '7 columns' },
    { value: '10', label: '10 columns' }
  ];

  // Load bird strikes data on component mount
  useEffect(() => {
    fetch(birdStrikesData)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            if (results.data) {
              // Sample the data immediately when loading
              const sampledData = sampleColumns(results.data, options.maxColumns);
              setData(sampledData);
              setActiveSource({
                id: 'bird-strikes',
                name: 'Bird Strikes Dataset',
                type: 'snapshot',
                lastUpdated: new Date(),
                fields: Object.keys(sampledData[0]).map(key => ({
                  name: key,
                  type: inferType(sampledData[0][key])
                }))
              });
              onDataChange(sampledData);
            }
          }
        });
      })
      .catch(console.error);
  }, [options.maxColumns]); // Add maxColumns as dependency

  // Remove the old sample data
  const loadSampleData = () => {
    setLoading({
      isLoading: true,
      progress: 0,
      fileName: 'bird-strikes.csv'
    });

    fetch(birdStrikesData)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            if (results.data) {
              const parsedData = results.data;
              processData(parsedData, 'Bird Strikes Dataset');
              setLoading(prev => ({ 
                ...prev, 
                isLoading: false, 
                progress: 100 
              }));
            }
          },
          error: (error) => {
            setLoading(prev => ({
              ...prev,
              isLoading: false,
              error: `Error loading sample data: ${error.message}`
            }));
          }
        });
      })
      .catch(error => {
        setLoading(prev => ({
          ...prev,
          isLoading: false,
          error: `Failed to load sample data: ${error.message}`
        }));
      });
  };

  const inferType = (value: any): string => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  // Modify sampleColumns to handle 'all' option
  const sampleColumns = (data: any[], maxColumns: number | 'all' = 5): any[] => {
    if (!data.length) return data;
    
    const allColumns = Object.keys(data[0]);
    // If 'all' is selected, return full data
    if (maxColumns === 'all') return data;
    
    // Rest of the existing sampling logic
    const mandatoryColumns = ['Airport: Name'];
    const mandatoryExisting = mandatoryColumns.filter(col => allColumns.includes(col));
    
    const remainingColumns = allColumns
      .filter(col => !mandatoryExisting.includes(col))
      .sort(() => Math.random() - 0.5)
      .slice(0, Number(maxColumns) - mandatoryExisting.length);
    
    const selectedColumns = [...mandatoryExisting, ...remainingColumns];
    
    return data.map(row => {
      const newRow: any = {};
      selectedColumns.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });
  };

  const processData = (rawData: any[], fileName: string) => {
    // Limit initial data load
    const maxInitialRows = 1000;
    const sampledData = rawData.slice(0, maxInitialRows);
    
    const fields = Object.keys(sampledData[0]).map(key => ({
      name: key,
      type: inferType(sampledData[0][key])
    }));

    setData(sampledData);
    setActiveSource({
      id: fileName,
      name: fileName,
      type: 'snapshot',
      lastUpdated: new Date(),
      fields
    });
    onDataChange(sampledData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLoading({
        isLoading: true,
        progress: 0,
        fileName: file.name
      });

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        chunk: (results, parser) => {
          // Process data in chunks to avoid memory issues
          processData(results.data, file.name);
          parser.abort(); // Stop after first chunk for now
        },
        error: (error) => {
          setLoading(prev => ({
            ...prev,
            isLoading: false,
            error: `Error parsing file: ${error.message}`
          }));
        },
        complete: () => {
          setLoading(prev => ({
            ...prev,
            isLoading: false,
            progress: 100
          }));
        }
      });
    }
  };

  const validateCSVStructure = (results: Papa.ParseResult<any>) => {
    // Add debug logging
    console.log('CSV Parse Results:', {
      dataLength: results.data?.length,
      firstRow: results.data?.[0],
      errors: results.errors,
      meta: results.meta
    });

    if (!results.data) {
      throw new Error('No data received from CSV parser');
    }

    // Check if we have data but it's not properly structured
    if (results.data.length === 0 || !results.meta?.fields?.length) {
      throw new Error('CSV appears to be malformed. Please check if the file has headers and data rows.');
    }

    // Log the first few rows for debugging
    console.log('First few rows:', results.data.slice(0, 3));
    console.log('Headers:', results.meta.fields);

    // Check header structure
    if (results.meta.fields.length === 1) {
      // This usually means the delimiter is wrong
      const header = results.meta.fields[0];
      if (header.includes(',') || header.includes(';')) {
        throw new Error('CSV format error: File appears to be using a different delimiter. Try converting to comma-separated CSV. Current header: ' + header);
      }
    }

    // Rest of the validation...
  };

  const getUniqueValues = (data: any[], fieldName: string) => {
    const allValues = data.map(item => item[fieldName]);
    const uniqueValues = Array.from(new Set(allValues));
    const total = uniqueValues.length;
    
    // Use the sampleSize from options
    const sampleSize = Math.min(options.sampleSize || 5, total);
    
    // Get random sample
    const selectedValues = uniqueValues
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize);
    
    return {
      values: selectedValues,
      total,
      hasMore: total > sampleSize
    };
  };

  // Update handleQueryChange to affect both filtered data and chart
  const handleQueryChange = (query: QueryCondition[]) => {
    if (!query.length) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      return query.every(condition => {
        const value = item[condition.field];
        if (value === undefined || value === null) return false;
        
        switch (condition.operator) {
          case 'equals':
            return value === condition.value || value?.toString() === condition.value;
          case 'contains':
            return value?.toString().toLowerCase().includes(condition.value.toLowerCase());
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

  // Add this new effect to handle chart updates
  useEffect(() => {
    if (chartOptions.xField && chartOptions.yField) {
      console.log('Chart options updated:', chartOptions);
      console.log('Current filtered data:', filteredData.length);
    }
  }, [chartOptions, filteredData]);

  // After the existing useEffect for data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Add this useEffect to preload the table
  useEffect(() => {
    if (!data.length) return;
    
    setPreloadedTable(
      <div className="data-table">
        <table>
          <thead>
            <tr>
              {Object.keys(data[0]).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, 100).map((row, i) => (
              <tr key={i}>
                {Object.keys(data[0]).map(key => (
                  <td key={key}>{String(row[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [data, filteredData]);

  // Add chart configuration section to the side panel
  const renderChartConfig = () => {
    if (!data.length) return null;
    
    const numericalFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number'
    );
    
    const categoricalFields = Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'string'
    );

    return (
      <div className="chart-config">
        <div className="config-group">
          <label>Chart Type</label>
          <select
            value={chartOptions.type}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              type: e.target.value as 'bar' | 'line'
            }))}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="point">Scatter Plot</option>
          </select>
        </div>

        <div className="config-group">
          <label>X Axis</label>
          <select
            value={chartOptions.xField}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              xField: e.target.value
            }))}
          >
            <option value="">Select field</option>
            {Object.keys(data[0]).map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        <div className="config-group">
          <label>Y Axis</label>
          <select
            value={chartOptions.yField}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              yField: e.target.value
            }))}
          >
            <option value="">Select field</option>
            {numericalFields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        <div className="config-group">
          <label>Aggregation</label>
          <select
            value={chartOptions.aggregation}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              aggregation: e.target.value
            }))}
          >
            <option value="count">Count</option>
            <option value="sum">Sum</option>
            <option value="mean">Average</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
          </select>
        </div>

        <div className="config-group">
          <label>Color By</label>
          <select
            value={chartOptions.color}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              color: e.target.value
            }))}
          >
            <option value="">None</option>
            {categoricalFields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const toggleView = (view: 'chart' | 'data') => {
    setViewOptions(prev => {
      const newState = { ...prev, [view]: !prev[view] };
      // Ensure at least one is always true
      if (!newState.showChart && !newState.showData) {
        newState[view] = true;
      }
      return newState;
    });
  };

  const renderChart = () => {
    if (!chartOptions.xField || (chartOptions.aggregation !== 'count' && !chartOptions.yField)) {
      return <div className="chart-placeholder">Please select fields to visualize</div>;
    }

    return (
      <VegaChart 
        data={filteredData}
        options={chartOptions}
        fields={data.length ? Object.keys(data[0]).map(key => ({
          name: key,
          type: typeof data[0][key] === 'number' ? 'quantitative' : 
                data[0][key] instanceof Date ? 'temporal' : 'nominal'
        })) : []}
      />
    );
  };

  return (
    <div className="data-source">
      <div className="header-section">
        <div className="dataset-info">
          <h2>{activeSource?.name || 'No Dataset Loaded'}</h2>
          <span className="dataset-type">Type: {activeSource?.type || 'snapshot'}</span>
          <span className="last-updated">
            Last Updated: {activeSource?.lastUpdated?.toLocaleString() || 'Never'}
          </span>
        </div>
        
        <div className="control-panel">
          <div className="control-group">
            <select 
              className="column-select"
              value={options.maxColumns}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                maxColumns: e.target.value === 'all' ? 'all' : Number(e.target.value)
              }))}
            >
              {columnOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="sample-control">
              <input
                type="number"
                value={options.sampleSize}
                onChange={(e) => {
                  const newSize = Math.max(1, parseInt(e.target.value) || 5);
                  setOptions(prev => ({
                    ...prev,
                    sampleSize: newSize
                  }));
                  if (data.length > 0) {
                    processData(data, activeSource?.name || '');
                  }
                }}
                className="sample-size-input"
                min="1"
                max="100"
              />
              <span className="input-label">samples</span>
            </div>
          </div>

          <div className="file-control">
            <button 
              className="file-select-btn"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload />
              <span>{selectedFile ? selectedFile.name : 'Select File'}</span>
            </button>
            <span className="supported-formats">JSON, CSV (max 50MB)</span>
            <input
              id="file-input"
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              className="load-sample-btn"
              onClick={loadSampleData}
            >
              Load Sample
            </button>
          </div>

          <div className="sampling-methods">
            <button
              className={`method-btn ${options.sampleMethod === 'random' ? 'active' : ''}`}
              onClick={() => setOptions(prev => ({ ...prev, sampleMethod: 'random' }))}
              title="Random Sampling"
            >
              🎲
            </button>
            <button
              className={`method-btn ${options.sampleMethod === 'frequency' ? 'active' : ''}`}
              onClick={() => setOptions(prev => ({ ...prev, sampleMethod: 'frequency' }))}
              title="Most Frequent"
            >
              📊
            </button>
            <button
              className={`method-btn ${options.sampleMethod === 'first' ? 'active' : ''}`}
              onClick={() => setOptions(prev => ({ ...prev, sampleMethod: 'first' }))}
              title="First N Values"
            >
              1️⃣
            </button>
          </div>
        </div>
      </div>
      
      <div className="data-source-content">
        <div className={`main-panel ${isPanelOpen ? 'panel-open' : ''}`}>
          {activeSource && (
            <div className="source-info">
              <h4>Fields:</h4>
              <ul className="field-list">
                {activeSource.fields.map(field => (
                  <li key={field.name} className="field-item">
                    <div className="field-header">
                      <span className="field-name">{field.name}</span>
                      <span className="field-type">
                        {getTypeIcon(field.type)}
                        <span className="type-text">({field.type})</span>
                      </span>
                    </div>
                    {data.length > 0 && (
                      <div className="field-values">
                        {(() => {
                          const { values, total, hasMore } = getUniqueValues(data, field.name);
                          return (
                            <>
                              {values.map((value, i) => (
                                <span key={i} className="value-tag">
                                  {String(value)}
                                </span>
                              ))}
                              {hasMore && (
                                <span className="more-values">
                                  +{total - values.length} more
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.length > 0 && (
            <div className="output-section">
              <div className="view-tabs">
                <button 
                  className={`view-tab ${viewOptions.showChart ? 'active' : ''}`}
                  onClick={() => setViewOptions({ showChart: true, showData: false })}
                >
                  Chart View
                </button>
                <button 
                  className={`view-tab ${viewOptions.showData ? 'active' : ''}`}
                  onClick={() => setViewOptions({ showChart: false, showData: true })}
                >
                  Data View
                </button>
              </div>
              
              <div className="view-container">
                {viewOptions.showChart && (
                  renderChart()
                )}
                
                {viewOptions.showData && (
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(data[0]).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, 100).map((row, i) => (
                          <tr key={i}>
                            {Object.keys(data[0]).map(key => (
                              <td key={key}>{String(row[key])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
          <button 
            className="side-panel-toggle"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
          >
            {isPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          
          <div className="query-visualization">
            <h2 className="section-title">Query & Visualization</h2>
              <QueryBuilder 
                fields={activeSource?.fields || []}
                onQueryChange={handleQueryChange}
              />
            <div className="chart-configuration">
              <h3 className="subsection-title">Chart Configuration</h3>
              {renderChartConfig()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 