const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const Database = require('better-sqlite3');
const archiver = require('archiver');
const extract = require('extract-zip');
const { exec } = require('child_process');
const url = require('url');

let db;
const isDev = !app.isPackaged;


const initializeDatabase = () => {
  const dbPath = isDev
    ? path.join(__dirname, 'database' , 'app.sqlite') // Development mode
    : path.join(process.resourcesPath, 'database' , 'app.sqlite'); // Production mode
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database initialized successfully');
    createTables();
  }
};

const createTables = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS lookups (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL,
      date TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      from_name TEXT NOT NULL,
      amount_usd DECIMAL(10, 2) NOT NULL,
      amount_pkr DECIMAL(10, 2) NOT NULL,
      cheque_number TEXT,
      account_details TEXT,
      against TEXT,
      approved_by TEXT,
      signature TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS payment_voucher_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_voucher_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_voucher_id) REFERENCES payment_vouchers(id)
    );
    CREATE TABLE IF NOT EXISTS petty_cash_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petty_cash_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petty_cash_id) REFERENCES petty_cash(id)
    );
    CREATE TABLE IF NOT EXISTS receipt_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id)
    );
  `;
  db.exec(query);
  console.log("Tables created successfully (if they didn't already exist)");
};

let mainWindow;

const createWindow = () => {
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.js') // Development mode
    : path.join(process.resourcesPath, 'preload.js'); // Production mode
  initializeDatabase();
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000'); // Development server
  } else {
    // production
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle database queries
ipcMain.handle('db-query', async (event, query, params = []) => {
  try {
    if (!db) {
      throw new Error(
        'Database is not initialized. Ensure initializeDatabase() is called.'
      );
    }
    console.log('Executing query:', query);

    const stmt = db.prepare(query);
    if (query.trim().toUpperCase().includes('SELECT')) {
      return stmt.all(params.length ? params : []);
    } else {
      const info = stmt.run(params.length ? params : []);
      return { success: true, insertId: info.lastInsertRowid || null };
    }
  } catch (error) {
    console.error('Database Error:', error.message);
    return { success: false, error: error.message };
  }
});

// Handle file saving
ipcMain.handle('save-file', async (_, { path: filePath, content }) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'public');
    await fs.mkdir(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, filePath);
    await fs.writeFile(fullPath, Buffer.from(content));

    return {
      success: true,
      path: `/uploads/${filePath}`,
    };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup', async () => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const databasePath = path.join(process.cwd(), 'database', 'app.sqlite');
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // Create the backup directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });

    // Use fs.promises.writeFile to write the ZIP archive
    const archive = require('archiver')('zip', { zlib: { level: 9 } });

    // Collect archive content as a Buffer
    const chunks = [];
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('error', (err) => {
      throw err;
    });

    // Add database and uploaded files to the ZIP archive
    archive.file(databasePath, { name: 'app.sqlite' });
    archive.directory(uploadsDir, 'uploads');

    // Finalize the archive
    await archive.finalize();

    // Combine the archive chunks into a single buffer and save it
    const archiveBuffer = Buffer.concat(chunks);
    await fs.writeFile(backupFilePath, archiveBuffer);

    return {
      success: true,
      message: 'Backup completed successfully',
      backupPath: backupFilePath,
    };
  } catch (error) {
    console.error('Error during backup:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (_, { filename }) => {
  try {
    const backupDir = path.join(process.cwd(), 'Backups');
    const databaseDir = path.join(process.cwd(), 'database');
    const uploadsDir = path.join(process.cwd(), 'public/uploads');

    console.log('Restoring backup file:', filename);

    // Validate the backup file name
    if (!filename || !filename.endsWith('.zip')) {
      throw new Error('Invalid backup file. Please upload a valid ZIP file.');
    }

    const fullBackupFilePath = path.resolve(backupDir, filename);
    await fs.access(fullBackupFilePath);

    // Extract the backup ZIP file to a temporary directory
    const tempDir = path.join(process.cwd(), 'temp_restore');
    await fs.mkdir(tempDir, { recursive: true });
    await extract(fullBackupFilePath, { dir: tempDir });

    // Delete the existing database
    const currentDatabasePath = path.join(databaseDir, 'app.sqlite');
    try {
      await fs.unlink(currentDatabasePath); // Attempt to delete the current database
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('Database already deleted or file busy:', err.message);
      }
    }

    // Copy the app.sqlite from the backup directory directly to the database directory
    const tempFile=filename.replace('.zip', '');
    const backupDatabasePath = path.join(tempDir,tempFile,'app.sqlite');
    await fs.copyFile(backupDatabasePath, currentDatabasePath);

    // Delete the existing uploads directory
    await fs.rm(uploadsDir, { recursive: true, force: true }).catch((err) => {
      console.error('Failed to delete uploads directory:', err.message);
    });

    // Restore files from the backup
    const backupUploadsDir = path.join(tempDir,tempFile,'uploads');
    await fs.mkdir(uploadsDir, { recursive: true }); // Ensure uploads directory exists
    await fs.cp(backupUploadsDir, uploadsDir, { recursive: true }).catch((err) => {
      console.error('Failed to restore uploads directory:', err.message);
    });

    // Clean up the temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      message: 'Backup restored successfully.',
    };
  } catch (error) {
    console.error('Error during restore:', error);
    return { success: false, error: error.message };
  }
});
