const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Handles database queries
  dbQuery: (query, params) => {
    if (typeof query !== 'string' || !query.trim()) {
      return Promise.reject(new Error('Invalid query: Query must be a non-empty string.'));
    }
    if (params && typeof params !== 'object') {
      return Promise.reject(new Error('Invalid parameters: Params must be an object or array.'));
    }
    return ipcRenderer.invoke('db-query', query, params);
  },

  // Handles file saving
  saveFile: ({ path, content }) => {
    if (!path || !content) {
      return Promise.reject(new Error('Invalid data: "path" and "content" are required.'));
    }
    return ipcRenderer.invoke('save-file', { path, content });
  },

  // Handles backup functionality
  backup: () => ipcRenderer.invoke('backup'),
  restoreBackup: ({ filename }) => {
    if (!filename) {
      return Promise.reject(new Error('filename not found'));
    }
    return ipcRenderer.invoke('restore-backup', { filename });
  },
});
