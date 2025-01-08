const db = require('../../database').default; // Import database connection

// Create Account Type
function createAccountType(id, name, callback) {
   const query = `INSERT INTO account_types (id, name) VALUES (? , ?)`;
   db.run(query, [id, name], (err) => {
      err ? callback(err, null) : callback(null, this.lastID);
   });
}

// Get All Account Types
function getAllAccountTypes(callback) {
   const query = `SELECT * FROM account_types`;
   db.all(query, [], (err, rows) => {
      err ? callback(err, null) : callback(null, rows);
   });
}

// Update Account Type
function updateAccountType(id, name, callback) {
   const query = `UPDATE account_types SET name = ? WHERE id = ?`;
   db.run(query, [name, id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

// Delete Account Type
function deleteAccountType(id, callback) {
   const query = `DELETE FROM account_types WHERE id = ?`;
   db.run(query, [id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

module.exports = {
   createAccountType,
   getAllAccountTypes,
   updateAccountType,
   deleteAccountType,
};


// All of these accounts are inserted except one coz no id is mentioned in the excel sheet for that name = 'نفقات المهمات الرسمية' 

// const accounts = [
//   { id: 122902, name: 'إستئجار وسائل النقل' },
//   { id: 1228018, name: 'بريد وهاتف وتلكس' },
//   { id: 1201004, name: 'وقود وزيوت وقوى محركة' },
//   { id: 1221077, name: 'صيانة وسائل النقل' },
//   { id: 1206009, name: 'مياه وكهرباء' },
//   { id: 1237016, name: 'أتعاب ومكافآت' },
//   { id: 12074018, name:  'أدوية ومواد طبية وكميائية'},
//   { id: 1238077, name: 'إشتراكات في الصحف والمجلات' },
//   { id: 1221046, name: 'صيانة الات ومعدات وأجهزة' },
//   { id: 1226010, name: 'نفقات الضيافة والحفلات' },
//   { id: 1202003, name: 'قطع غيار ومواد للصيانة' },
//   { id: 1203002, name: 'مواد ومهمات متنوعة' },
//   { id: 1205017, name: 'قرطاسية ومواد للطباعه' },
//   { id: 1238023, name: 'هدايا وأوسمة وجوائز' },
//   { id: 1101001, name: 'رواتب الموظفين' },
//   { id: 1245046, name: 'صيانه مباني ومنشاءت' },
//   { id: 1238015, name: 'اثاث وتجهيزات مكاتب ومباني' },
//   { id: 1208007, name: 'ملابس واقمشة وكساوي' },
//   { id: 1235018, name: 'مصروفات العلاج بالخارج' },
//   { id: 1303139, name: 'اجهزة الحاسبات الالية' },
//   { id: 1304004, name: 'اجهزة سلكية ولاسلكية' },
//   // { id: , name: 'نفقات المهمات الرسمية' },
//   { id: 1301014, name: 'سيارات ومركبات' },
//   { id: 12270296, name: 'إيجار اراضي ومباني' },
//   { id: 1106082, name: 'بدل ملابس' },
//   { id: 1238084, name: 'مصروفات نثرية متنوعة' },
//   { id: 1232004, name: 'نفقات النشاط الثقافي' },
//   { id: 1232005, name: 'نفقات النشاط الرياضي' },
//   { id: 1238015, name: 'مصروفات تأمين' },
// ];

// // Create each account
// accounts.forEach(account => {
//    createAccountType(account.id, account.name, (err, account_id) => {
//       if (err) {
//          console.error(`Error creating Account [${account.name}]:`, err.message);
//       } else {
//          console.log(`Account "${account.name}" created successfully with ID:`, account_id);
//       }
//    });
// });