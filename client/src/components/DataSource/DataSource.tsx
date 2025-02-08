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
}

interface QueryCondition {
  field: string;
  operator: string;
  value: string;
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
    sampleSize: 1000
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
    // This will now just re-trigger loading the bird strikes data
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
              setData(parsedData);
              setActiveSource({
                id: 'bird-strikes',
                name: 'Bird Strikes Dataset',
                type: 'snapshot',
                lastUpdated: new Date(),
                fields: Object.keys(parsedData[0]).map(key => ({
                  name: key,
                  type: inferType(parsedData[0][key])
                }))
              });
              onDataChange(parsedData);
            }
          }
        });
      })
      .catch(console.error);
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

  const processData = (newData: any[], fileName: string) => {
    const sampledData = sampleColumns(newData, options.maxColumns);
    setData(sampledData);
    setActiveSource({
      id: fileName,
      name: fileName,
      type: 'snapshot',
      lastUpdated: new Date(),
      fields: Object.keys(sampledData[0]).map(key => ({
        name: key,
        type: inferType(sampledData[0][key])
      }))
    });
    onDataChange(sampledData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLoading({
        isLoading: false,
        progress: 0,
        fileName: file.name
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

  const loadFile = () => {
    if (!selectedFile) return;

    setLoading(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: undefined
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Invalid file content');
        }

        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          complete: (results: Papa.ParseResult<ParsedData>) => {
            if (results.data && results.data.length > 0 && typeof results.data[0] === 'object' && results.data[0] !== null) {
              const fields = Object.keys(results.data[0]).map(key => ({
                name: key,
                type: inferType(results.data[0][key])
              }));
              setData(results.data);
              setActiveSource({
                id: selectedFile.name,
                name: selectedFile.name,
                type: 'snapshot',
                lastUpdated: new Date(),
                fields
              });
              onDataChange(results.data);
              setLoading(prev => ({ ...prev, isLoading: false, progress: 100 }));
            }
          },
          error: (error) => {
            setLoading(prev => ({
              ...prev,
              isLoading: false,
              error: `Error parsing file: ${error.message}`
            }));
          }
        });
      } catch (error) {
        setLoading(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error reading file'
        }));
      }
    };

    reader.readAsText(selectedFile);
  };

  const getUniqueValues = (data: any[], fieldName: string, limit: number = 20) => {
    const values = [...new Set(data.map(item => item[fieldName]))];
    const total = values.length;
    return {
      values: values.slice(0, limit),
      total,
      hasMore: total > limit
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
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return value?.toString().toLowerCase().includes(condition.value.toLowerCase());
          case 'greater_than':
            return value > Number(condition.value);
          case 'less_than':
            return value < Number(condition.value);
          case 'between':
            const range = JSON.parse(condition.value);
            return value >= Number(range.min) && value <= Number(range.max);
          case 'starts_with':
            return value?.toString().toLowerCase().startsWith(condition.value.toLowerCase());
          case 'ends_with':
            return value?.toString().toLowerCase().endsWith(condition.value.toLowerCase());
          default:
            return true;
        }
      });
    });
    setFilteredData(filtered);
  };

  // Initialize filteredData when data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Add chart configuration section to the side panel
  const renderChartConfig = () => {
    if (!data.length) return null;
    
    // Get all fields from the data
    const allFields = Object.keys(data[0]);
    
    // Identify numeric fields for Y-axis
    const numericFields = allFields.filter(field => 
      typeof data[0][field] === 'number' || 
      !isNaN(Number(data[0][field]))
    );
    
    // All fields can be used for X-axis, grouping, and coloring
    const categoricalFields = allFields.filter(field => 
      typeof data[0][field] === 'string' ||
      data[0][field] instanceof Date
    );

    return (
      <div className="chart-config">
        <h4 className="config-section-title">Chart Configuration</h4>
        
        <div className="config-group">
          <label>Chart Type</label>
          <select
            value={chartOptions.type}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              type: e.target.value as any
            }))}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="point">Scatter Plot</option>
            <option value="circle">Bubble Chart</option>
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
            {allFields.map(field => (
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
            {numericFields.map(field => (
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
              aggregation: e.target.value as any
            }))}
          >
            <option value="count">Count</option>
            <option value="sum">Sum</option>
            <option value="mean">Average</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
            <option value="median">Median</option>
          </select>
        </div>

        <div className="config-group">
          <label>Group By</label>
          <select
            value={chartOptions.groupBy}
            onChange={(e) => setChartOptions(prev => ({
              ...prev,
              groupBy: e.target.value
            }))}
          >
            <option value="">None</option>
            {categoricalFields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
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

  return (
    <div className="data-source">
      <div className="data-source-header">
        <div className="header-main">
          <h2 className="data-source-title">{activeSource?.name}</h2>
          <div className="data-source-metadata">
            <span className="data-source-type">Type: {activeSource?.type}</span>
            <span className="data-source-date">
              Last Updated: {activeSource?.lastUpdated.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="header-controls">
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
          <button 
            className="reload-btn"
            onClick={() => processData(data, activeSource?.name || '')}
            title="Resample columns"
          >
            ↻
          </button>
        </div>
      </div>
      
      <div className="data-source-content">
        <div className={`main-panel ${isPanelOpen ? 'panel-open' : ''}`}>
          <div className="input-section">
            <div className="source-controls">
              <div className="file-input-group">
                <div className="file-upload">
                  <button 
                    className="file-upload-button"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload />
                  </button>
                  <span className="file-name">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                  <span className="supported-formats">
                    Supported: JSON, CSV (max 50MB)
                  </span>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
                <button 
                  className="load-sample-btn"
                  onClick={loadSampleData}
                >
                  Load Sample Data
                </button>
              </div>
            </div>

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
          </div>

          {data.length > 0 && (
            <div className="output-section">
              <VegaChart 
                data={filteredData}
                options={chartOptions}
                fields={data.length ? Object.keys(data[0]).map(key => ({
                  name: key,
                  type: typeof data[0][key]
                })) : []}
              />
              <div className="data-preview">
                <h2>Data Preview</h2>
                <pre>{JSON.stringify(filteredData.slice(0, 10), null, 2)}</pre>
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
          
          <div className="query-builder-container">
            <div className="query-builder-header">
              <h3 className="query-builder-title">Query & Visualization</h3>
            </div>
            
            <QueryBuilder 
              onQueryChange={handleQueryChange}
              availableFields={data.length ? Object.keys(data[0]) : []}
              fieldTypes={data.length ? Object.keys(data[0]).reduce((types, key) => ({
                ...types,
                [key]: typeof data[0][key]
              }), {}) : {}}
            />
            
            {renderChartConfig()}
          </div>
        </div>
      </div>
    </div>
  );
}; 