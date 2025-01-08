const db = require('../../database').default;

// Create Voucher
function createVoucher(type, date, accountId, amount, description, userId, callback) {
   const query = ` INSERT INTO vouchers (type, date, account_id, amount, description, user_id) VALUES (?, ?, ?, ?, ?, ?)`;
   db.run(query, [type, date, accountId, amount, description, userId], (err) => {
      err ? callback(err, null) : callback(null, this.lastID);
   });
}

// Get All Vouchers - For Admin
function getAllVouchers(callback) {
   const query = `SELECT * FROM vouchers`;
   db.all(query, [], (err, rows) => {
      err ? callback(err, null) : callback(null, rows);
   });
}

// Get All Vouchers associated with a single user
function getVouchersByUser(userId, callback) {
   const query = `SELECT * FROM vouchers WHERE user_id = ?`;
   db.all(query, [userId], (err, rows) => {
      err ? callback(err, null) : callback(null, rows);
   })
}

// Update Voucher
function updateVoucher(id, type, amount, callback) {
   const query = `UPDATE vouchers SET type = ?, amount = ? WHERE id = ?`;
   db.run(query, [type, amount, id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

// Delete Voucher
function deleteVoucher(id, callback) {
   const query = `DELETE FROM vouchers WHERE id = ?`;
   db.run(query, [id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

module.exports = {
   createVoucher,
   getAllVouchers,
   updateVoucher,
   deleteVoucher,
   getVouchersByUser,
};