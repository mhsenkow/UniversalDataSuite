interface ConnectionStatus {
  isConnected: boolean;
  latency: number;
  lastChecked: Date;
  errors?: string[];
}

export class ConnectionMonitor {
  private connections: Map<string, ConnectionStatus> = new Map();
  private checkInterval: number = 30000; // 30 seconds

  startMonitoring(sourceId: string, checkFn: () => Promise<boolean>) {
    const monitor = async () => {
      const start = Date.now();
      try {
        const isConnected = await checkFn();
        const latency = Date.now() - start;
        
        this.connections.set(sourceId, {
          isConnected,
          latency,
          lastChecked: new Date(),
          errors: isConnected ? undefined : ['Connection failed']
        });
      } catch (error) {
        this.connections.set(sourceId, {
          isConnected: false,
          latency: Date.now() - start,
          lastChecked: new Date(),
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    };

    // Initial check
    monitor();
    
    // Set up periodic monitoring
    const intervalId = setInterval(monitor, this.checkInterval);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  getStatus(sourceId: string): ConnectionStatus | undefined {
    return this.connections.get(sourceId);
  }
} 