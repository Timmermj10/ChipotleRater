const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors module
const pool = require('./dbconfig'); // Import the PostgreSQL connection pool (make sure that the databse info is not in the GitHub repo!)

const app = express();
const port = 3001;

app.use(cors()); // Use cors middleware to enable CORS

app.use(bodyParser.json());

// API endpoint to handle rating submissions
app.post('/api/submit-rating', async (req, res) => {
  const { locationName, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments } = req.body;

  try {
    const query = 'INSERT INTO reviews(location_name, food_quality, food_amount, service_quality, time_taken, extra_comments) VALUES($1, $2, $3, $4, $5, $6)';
    const values = [locationName, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments];

    await pool.query(query, values);

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});