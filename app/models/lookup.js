// /lib/lookupQueries.js

const { db } = require('../../database');

// Get all lookup records
const getAllLookups = async () => {
  const query = `SELECT value FROM lookups WHERE key = ?`;
        const response = await electronAPI.dbQuery(query, [key]);
        return response;
        
           
       
};

// Insert a new lookup record
const insertLookup = async (name, value) => {
  return db.insert(lookups).values({ name, value }).run();
};

// Update an existing lookup record
const updateLookup = async (id, value) => {
  return db
    .update(lookups)
    .set({ value })
    .where(eq(lookups.id, id))
    .run();
};

// Delete a lookup record
const deleteLookup = async (id) => {
  return db.delete(lookups).where(eq(lookups.id, id)).run();
};

module.exports = { getAllLookups, insertLookup, updateLookup, deleteLookup };
