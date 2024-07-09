const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
const pool = require('../api/dbconfig.js'); // Import the PostgreSQL connection pool (make sure that the database info is not in the GitHub repo!)

const csvFilePath = '../WebscrapLocationData/cleaned_chipotle_locations_v2.csv';

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const { state, city, address, zip_code, name, phone, latitude, longitude, url, country } = row;
    const query = 'INSERT INTO locations(state, city, address, zip_code, name, phone, latitude, longitude, url, country) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    const values = [state, city, address, zip_code, name, phone, latitude, longitude, url, country];
    
    pool.query(query, values, (err, res) => {
      if (err) {
        console.error('Error executing query', err.stack);
      } else {
        console.log('Inserted:', name);
      }
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
