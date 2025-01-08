declare global {
    interface Window {
      electronAPI: {
        dbQuery: (query: string, params: any[]) => Promise<any>;
        saveFile: (data: { path: string; content: string }) => Promise<any>;
        backup: () => Promise<any>;
        restoreBackup: (data: { filename: string }) => Promise<any>;
      };
    }
  }
  
  export {};  