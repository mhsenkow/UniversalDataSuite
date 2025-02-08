import React, { useState } from 'react';
import { QueryCondition, QueryOperator } from '../../types';
import './QueryBuilder.css';

interface QueryBuilderProps {
  onQueryChange: (query: any) => void;
  availableFields: string[];
  fieldTypes: Record<string, string>;
}

interface RangeValue {
  min: string;
  max: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onQueryChange, availableFields, fieldTypes }) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);

  const getOperatorsForType = (fieldName: string): Array<{value: QueryOperator, label: string}> => {
    const type = fieldTypes[fieldName] || 'string';
    
    switch (type) {
      case 'number':
        return [
          { value: 'equals', label: 'equals' },
          { value: 'greater_than', label: 'greater than' },
          { value: 'less_than', label: 'less than' },
          { value: 'between', label: 'between' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'on' },
          { value: 'greater_than', label: 'after' },
          { value: 'less_than', label: 'before' },
          { value: 'between', label: 'between' }
        ];
      case 'boolean':
        return [
          { value: 'equals', label: 'is' }
        ];
      default: // string
        return [
          { value: 'equals', label: 'equals' },
          { value: 'contains', label: 'contains' },
          { value: 'starts_with', label: 'starts with' },
          { value: 'ends_with', label: 'ends with' }
        ];
    }
  };

  const getInputType = (fieldName: string): string => {
    const type = fieldTypes[fieldName] || 'string';
    switch (type) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  };

  const renderInput = (condition: QueryCondition, index: number) => {
    const type = fieldTypes[condition.field] || 'string';
    
    if (condition.operator === 'between') {
      const range: RangeValue = condition.value ? JSON.parse(condition.value) : { min: '', max: '' };
      return (
        <div className="between-inputs">
          <input
            type={getInputType(condition.field)}
            value={range.min}
            onChange={(e) => {
              const newRange = { ...range, min: e.target.value };
              updateCondition(index, { value: JSON.stringify(newRange) });
            }}
            placeholder="Min"
          />
          <span>and</span>
          <input
            type={getInputType(condition.field)}
            value={range.max}
            onChange={(e) => {
              const newRange = { ...range, max: e.target.value };
              updateCondition(index, { value: JSON.stringify(newRange) });
            }}
            placeholder="Max"
          />
        </div>
      );
    }

    if (type === 'boolean') {
      return (
        <select
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    return (
      <input
        type={getInputType(condition.field)}
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        placeholder={`Enter ${type}`}
      />
    );
  };

  const addCondition = () => {
    const newCondition: QueryCondition = {
      field: availableFields[0],
      operator: 'equals',
      value: '',
    };
    setConditions([...conditions, newCondition]);
    onQueryChange([...conditions, newCondition]);
  };

  const updateCondition = (index: number, updates: Partial<QueryCondition>) => {
    const updatedConditions = conditions.map((condition, i) => {
      if (i !== index) return condition;
      
      const newCondition = { ...condition, ...updates };
      
      // Reset value when operator changes
      if (updates.operator) {
        newCondition.value = updates.operator === 'between' ? JSON.stringify({min: '', max: ''}) : '';
      }
      
      // Reset value when field changes
      if (updates.field) {
        newCondition.value = '';
      }
      
      return newCondition;
    });
    
    setConditions(updatedConditions);
    onQueryChange(updatedConditions);
  };

  const deleteCondition = (index: number) => {
    const updatedConditions = conditions.filter((_, i) => i !== index);
    setConditions(updatedConditions);
    onQueryChange(updatedConditions);
  };

  return (
    <div className="query-builder">
      <h3>Query Builder</h3>
      <p>Query interface will be implemented here</p>
      <div className="conditions">
        {conditions.map((condition, index) => (
          <div key={index} className="condition">
            <select
              value={condition.field}
              onChange={(e) => updateCondition(index, { 
                field: e.target.value,
                operator: getOperatorsForType(e.target.value)[0].value
              })}
            >
              {availableFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, { 
                operator: e.target.value as QueryOperator 
              })}
            >
              {getOperatorsForType(condition.field).map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {renderInput(condition, index)}
            <button onClick={() => deleteCondition(index)} className="delete-btn">×</button>
          </div>
        ))}
      </div>
      <button onClick={addCondition} className="add-btn">Add Condition</button>
    </div>
  );
}; 