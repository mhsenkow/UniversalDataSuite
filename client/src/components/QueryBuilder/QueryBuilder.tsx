import React, { useState } from 'react';
import { QueryCondition, QueryOperator } from '../../types';
import './QueryBuilder.css';

interface QueryBuilderProps {
  fields: Array<{name: string, type: string}>;
  onQueryChange: (query: QueryCondition[]) => void;
}

interface RangeValue {
  min: string;
  max: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ fields, onQueryChange }) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);

  const handleAddCondition = () => {
    const newCondition: QueryCondition = {
      field: fields[0]?.name || '',
      operator: 'equals',
      value: ''
    };
    setConditions([...conditions, newCondition]);
    onQueryChange([...conditions, newCondition]);
  };

  const getOperatorsForType = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    const type = field?.type || 'string';

    switch (type) {
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'between', label: 'Between' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'After' },
          { value: 'less_than', label: 'Before' }
        ];
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'starts_with', label: 'Starts With' },
          { value: 'ends_with', label: 'Ends With' }
        ];
    }
  };

  const getInputType = (fieldName: string): string => {
    const type = fields.find(f => f.name === fieldName)?.type || 'string';
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
    const type = fields.find(f => f.name === condition.field)?.type || 'string';
    
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
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('drag-over');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('drag-over');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('drag-over');
          const fieldName = e.dataTransfer.getData('text/plain');
          updateCondition(index, { value: fieldName });
        }}
      />
    );
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
              {fields.map(field => (
                <option key={field.name} value={field.name}>{field.name}</option>
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
      <button onClick={handleAddCondition} className="add-btn">Add Condition</button>
    </div>
  );
}; 