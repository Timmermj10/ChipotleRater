const { Pool } = require('pg');
const pool = require('../api/dbconfig.js'); // Import the PostgreSQL connection pool

// Get the table names from command line arguments
const tablesToDrop = process.argv.slice(2);

if (tablesToDrop.length === 0) {
    console.error('Please provide at least one table name to drop.');
    process.exit(1);
}

// Construct the SQL query to drop the specified tables
const dropQuery = tablesToDrop.map(table => `DROP TABLE IF EXISTS ${table} CASCADE;`).join(' ');

pool.query(dropQuery, (err, res) => {
    if (err) {
        console.error('Error executing drop tables query:', err);
    } else {
        console.log('Tables dropped successfully:', tablesToDrop.join(', '));
    }
    pool.end();
});