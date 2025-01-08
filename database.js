// /lib/db.js
const Database = require('better-sqlite3');
const path = require('path');
let db;

const initializeDatabase = () => {
  const dbPath = path.join(process.cwd(), 'database', 'app.sqlite');
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database initialized successfully');
    createTables();
  }
};

const createTables = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS petty_cash (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_number INT NOT NULL,
    exchange_approval VARCHAR(255),
    military_attache_name VARCHAR(255),
    accountant_name VARCHAR(255),
    receiver_signature VARCHAR(255),
    total_usd DECIMAL(10, 2) NOT NULL,
    total_pkr DECIMAL(10, 2) NOT NULL,
    amount_in_words TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS petty_cash_rows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    petty_cash_id INT NOT NULL,
    description TEXT NOT NULL,
    usd_amount DECIMAL(10, 2) NOT NULL,
    pkr_amount DECIMAL(10, 2) NOT NULL,
    beneficiary VARCHAR(255) NOT NULL,
    FOREIGN KEY (petty_cash_id) REFERENCES petty_cash(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_voto_no TEXT NOT NULL,
  serial_no TEXT NOT NULL,
  is_mustaaz BOOLEAN NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  beneficiary TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  cheque_no TEXT NOT NULL,
  exchange_rate REAL NOT NULL,
  total_usd REAL NOT NULL,
  total_pkr REAL NOT NULL,
  amount_in_words TEXT NOT NULL,
  accountant_signature TEXT,
  auditor_signature TEXT,
  status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE payment_vouchers
ADD COLUMN status TEXT DEFAULT 'Active';

CREATE TABLE IF NOT EXISTS payment_voucher_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_voucher_id INTEGER NOT NULL,
  invoice_no TEXT NOT NULL,
  description TEXT NOT NULL,
  usd REAL NOT NULL,
  pkr REAL NOT NULL,
  FOREIGN KEY(payment_voucher_id) REFERENCES payment_vouchers(id) ON DELETE CASCADE
);


  `;
  db.exec(query);
  console.log('Tables created successfully (if they didn\'t already exist)');
};

module.exports = { db, initializeDatabase };

// const path = require('path');
// const fs = require('fs');
// const Database = require('better-sqlite3');

// let db;

// function initializeDatabase() {
//   const dbPath = path.join(__dirname, 'client_database.db');

//   const isNewDatabase = !fs.existsSync(dbPath);
//   db = new Database(dbPath, { verbose: console.log });

//   if (isNewDatabase) {
//     console.log('Database file not found. Creating a new database and initializing tables...');

//     const createTables = `
//       CREATE TABLE IF NOT EXISTS lookups (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL UNIQUE,
//       value TEXT NOT NULL
//     );
//     `;

//     db.exec(createTables);
//     console.log('Tables initialized.');
//   } else {
//     console.log('Database already exists. Skipping initialization.');
//   }
// }

// module.exports = {
//   initializeDatabase,
//   db,
// };



// const { drizzle } = require('drizzle-orm/better-sqlite3');
// const Database = require('better-sqlite3');
// const { sqliteTable, text, integer } = require('drizzle-orm/sqlite-core');
// const path = require('path');

// // Path to the SQLite database file
// const dbPath = path.join(process.cwd(), 'database', 'app.sqlite');

// const sqlite = new Database(dbPath, { verbose: console.log });
// const db = drizzle(sqlite);

// // Define lookup table schema
// const lookups = sqliteTable('lookups', {
//   id: integer('id').primaryKey({ autoIncrement: true }),
//   name: text('name').notNull().unique(),
//   value: text('value').notNull(),
// });

// // Ensure the table exists
// (async () => {
//   await db.run(
//     `CREATE TABLE IF NOT EXISTS lookups (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL UNIQUE,
//       value TEXT NOT NULL
//     );`
//   );
// })();

// module.exports = { db, lookups };




  // db.run(
  //   `CREATE TABLE IF NOT EXISTS users (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     name TEXT NOT NULL UNIQUE,
  //     role TEXT NOT NULL CHECK(role IN ('admin', 'moderator', 'viewer')),
  //     password TEXT NOT NULL
  //   );`, 
  //   (err) => { 
  //       err ? console.error('Error creating table:', err.message) : console.log('Users table created successfully.'); 
  //   }
  // );
  
  // db.run(
  //   `CREATE TABLE IF NOT EXISTS vouchers (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       type TEXT NOT NULL,
  //       date TEXT NOT NULL DEFAULT (datetime('now')),
  //       account_id INTEGER NOT NULL,
  //       amount DECIMAL(10,2) NOT NULL,
  //       description TEXT,
  //       user_id INTEGER NOT NULL,
  //       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  //       FOREIGN KEY (account_id) REFERENCES account_types(id) ON DELETE CASCADE
  //   );`, 
  //   (err) => { 
  //       err ? console.error('Error creating table:', err.message) : console.log('Vouchers table created successfully.'); 
  //   }
  // );

  // ! Update Table field without losing the data or getting error 
  // 1: Create a temporary table with the updated schema
  // db.run(
  //     `CREATE TABLE IF NOT EXISTS vouchers_new (
  //         id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         type TEXT NOT NULL,
  //         date TEXT NOT NULL DEFAULT (datetime('now')),
  //         account_id INTEGER NOT NULL,
  //         amount DECIMAL(10,2) NOT NULL,
  //         description TEXT,
  //         user_id INTEGER NOT NULL,
  //         FOREIGN KEY (user_id) REFERENCES users(id),
  //         FOREIGN KEY (account_id) REFERENCES account_types(id)
  //     );`,
  //     (err) => {
  //         if (err) {
  //             console.error('Error creating new table:', err.message);
  //         } else {
  //             console.log('Temporary vouchers_new table created successfully.');

  //             // 2: Copy data from the old table to the new table
  //             db.run(
  //                 `INSERT INTO vouchers_new (id, type, date, account_id, amount, description, user_id)
  //                 SELECT id, type, date, account_id, amount, description, user_id FROM vouchers;`,
  //                 (err) => {
  //                     if (err) {
  //                       console.error('Error copying data:', err.message);
  //                     } else {
  //                         console.log('Data copied successfully.');

  //                         // 3: Drop the old table
  //                         db.run(`DROP TABLE vouchers;`, (err) => {
  //                             if (err) {
  //                                 console.error('Error dropping old table:', err.message);
  //                             } else {
  //                                 console.log('Old vouchers table dropped successfully.');

  //                                 // 4: Rename the new table to the original name
  //                                 db.run(`ALTER TABLE vouchers_new RENAME TO vouchers;`, (err) => {
  //                                     if (err) {
  //                                         console.error('Error renaming new table:', err.message);
  //                                     } else {
  //                                         console.log('vouchers_new table renamed to vouchers successfully.');
  //                                     }
  //                                 });
  //                             }
  //                         });
  //                     }
  //                 }
  //             );
  //         }
  //     }
  // );

