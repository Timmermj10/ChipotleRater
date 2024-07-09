const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
const pool = require('../api/dbconfig.js'); // Import the PostgreSQL connection pool (make sure that the database info is not in the GitHub repo!)

const schemaFilePath = path.join(__dirname, 'schema.sql');

fs.readFile(schemaFilePath, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
        console.error('Error reading the schema file:', err);
        return;
    }

    pool.query(data, (err, res) => {
        if (err) {
            console.error('Error executing schema:', err);
        } else {
            console.log('Schema created successfully');
        }
        pool.end();
    });
});