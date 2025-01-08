const db = require('../../database');

// Create User
function createUser(name, role, password, callback) {
   const query = `INSERT INTO users (name, role, password) VALUES (?, ?, ?)`;
   db.run(query, [name, role, password], (err) => {
      err ? callback(err, null) : callback(null, this.lastID);
   });
}

const loginUser = async (username, password) => {
   const query = `SELECT * FROM users WHERE name = ? AND password = ?`;
   const response  = await electronAPI.dbQuery(query, [username, password]);
   return response;
};





// Get All Users
function getAllUsers(callback) {
   const query = `SELECT * FROM users`;
   db.all(query, [], (err, rows) => {
      err ? callback(err, null) : callback(null, rows); // `rows` contains all the records from the `users` table
   });
}

// Update User Role
function updateUserRole(id, role, callback) {
   const query = `UPDATE users SET role = ? WHERE id = ?`;
   db.run(query, [role, id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

// Update User Password
function updateUserPassword(id, password, callback) {
   const query = `UPDATE users SET password = ? WHERE id = ?`;
   db.run(query, [password, id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}

// Delete User
function deleteUser(id, callback) {
   const query = `DELETE FROM users WHERE id = ?`;
   db.run(query, [id], (err) => {
      err ? callback(err, null) : callback(null, this.changes);
   });
}






module.exports = {
   createUser,
   getAllUsers,
   updateUserRole,
   deleteUser,
   updateUserPassword,
   loginUser
};