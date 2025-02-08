import React from 'react';
import { HealthMonitorService } from '../../services/HealthMonitorService';

interface DataHealthIndicatorProps {
  data: any[];
}

export const DataHealthIndicator: React.FC<DataHealthIndicatorProps> = ({ data }) => {
  const healthService = new HealthMonitorService();
  const metrics = healthService.calculateDataHealth(data);

  return (
    <div className="health-indicators">
      <h4>Data Health</h4>
      <div className="metrics">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="metric">
            <label>{key}</label>
            <div className="meter">
              <div 
                className="fill" 
                style={{ width: `${value}%`, backgroundColor: value > 80 ? '#28a745' : '#dc3545' }} 
              />
            </div>
            <span>{Math.round(value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 