import React, { useState, useEffect } from 'react';
import { DataSource as DataSourceType } from '../../types';
import Papa from 'papaparse';
import './DataSource.css';
import { DatasetService } from '../../services/DatasetService';
import { DataHealthIndicator } from './DataHealthIndicator';
import birdStrikesData from '../../data/bird-strikes.csv';
import {
  Document,         // For text/string data
  DataStructured,   // For numeric data
  CalendarEvent,    // For dates
  Checkmark,        // For boolean values
  HelpFilled,
  CharacterWholeNumber,
  Switcher,
  CharacterLowerCase
} from '@carbon/icons-react';

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

export const DataSource: React.FC<DataSourceProps> = ({ onDataChange }) => {
  const [activeSource, setActiveSource] = useState<DataSourceType | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    fileName: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  }, []);

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
    if (value === undefined || value === null) return 'string';
    if (!isNaN(Number(value))) return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  };

  const processData = (newData: any[], fileName: string) => {
    // Validate data
    if (!newData || !newData[0] || typeof newData[0] !== 'object') {
      throw new Error('Invalid data format: Expected array of objects');
    }

    // Infer field types from the first row
    const fields = Object.entries(newData[0]).map(([key, value]) => ({
      name: key,
      type: inferType(value)
    }));

    setData(newData);
    setActiveSource({
      id: fileName,
      name: fileName,
      type: 'snapshot',
      lastUpdated: new Date(),
      fields
    });
    onDataChange(newData);
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

    const estimatedRows = Math.ceil(selectedFile.size / 100);
    setLoading({
      isLoading: true,
      progress: 0,
      fileName: selectedFile.name,
      error: undefined,
      totalRows: estimatedRows,
      loadedRows: 0
    });

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileType === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result;
          if (!fileContent || typeof fileContent !== 'string') {
            throw new Error('Failed to read file content');
          }

          // Parse the CSV directly without delimiter detection
          Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: 'greedy',
            transform: (value) => value?.trim() || '',
            transformHeader: (header) => header.trim(),
            complete: (results) => {
              try {
                if (!results?.data) {
                  throw new Error('No data received from CSV parser');
                }

                const cleanData = results.data.filter(row => {
                  if (!row || typeof row !== 'object') return false;
                  const values = Object.values(row).filter(v => v !== undefined);
                  return values.length > 0 && values.some(v => v !== null && v !== '');
                });

                if (cleanData.length === 0) {
                  throw new Error('No valid data found in file');
                }

                processData(cleanData, selectedFile.name);
                setLoading({
                  isLoading: false,
                  progress: 100,
                  fileName: selectedFile.name,
                  loadedRows: cleanData.length,
                  totalRows: cleanData.length
                });
                setSelectedFile(null);
              } catch (error) {
                console.error('CSV processing error:', error);
                setLoading(prev => ({
                  ...prev,
                  isLoading: false,
                  error: error instanceof Error ? error.message : 'Error processing CSV data'
                }));
              }
            },
            error: (error) => {
              console.error('Papa Parse error:', error);
              setLoading(prev => ({
                ...prev,
                isLoading: false,
                error: `Error parsing CSV: ${error.message}`
              }));
            }
          });
        } catch (error) {
          console.error('File reading error:', error);
          setLoading(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error reading file'
          }));
        }
      };

      reader.onerror = () => {
        setLoading(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error reading file'
        }));
      };

      reader.readAsText(selectedFile, 'utf-8');
    } else if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (!Array.isArray(json)) {
            throw new Error('JSON must be an array of objects');
          }
          if (json.length === 0) {
            throw new Error('File contains no data');
          }
          processData(json, selectedFile.name);
          setLoading(prev => ({ ...prev, isLoading: false, progress: 100 }));
        } catch (error) {
          setLoading(prev => ({
            ...prev,
            isLoading: false,
            error: `Error parsing JSON: ${error.message}`
          }));
        }
      };

      reader.onerror = () => {
        setLoading(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error reading file'
        }));
      };

      reader.readAsText(selectedFile);
    }
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

  return (
    <div className="data-source">
      <h2>Data Source</h2>
      <div className="source-controls">
        <button onClick={loadSampleData}>Load Sample Data</button>
        <div className="file-upload">
          <div className="file-input-group">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              id="file-input"
            />
            {selectedFile && (
              <button 
                onClick={loadFile}
                className="load-btn"
                disabled={loading.isLoading}
              >
                {loading.isLoading ? 'Loading...' : 'Load File'}
              </button>
            )}
          </div>
          <small>Supported formats: JSON, CSV (max 50MB)</small>
          
          {/* Loading indicator with error handling */}
          {(selectedFile || loading.isLoading) && (
            <div className={`loading-status ${loading.error ? 'error' : ''}`}>
              <div className="file-info">
                <span>{loading.fileName}</span>
                {loading.loadedRows && !loading.error && (
                  <span className="row-count">
                    {loading.loadedRows.toLocaleString()} rows
                  </span>
                )}
              </div>
              {loading.error ? (
                <div className="error-message">
                  {loading.error}
                </div>
              ) : (
                <>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${loading.progress}%` }}
                    />
                  </div>
                  {loading.isLoading && (
                    <div className="loading-text">
                      Loading... {Math.round(loading.progress)}%
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {activeSource && (
        <div className="source-info">
          <h3>{activeSource.name}</h3>
          <p>Type: {activeSource.type}</p>
          <p>Last Updated: {activeSource.lastUpdated.toLocaleString()}</p>
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
  );
}; 