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
  const { locationId, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments } = req.body;

  try {
    const query = 'INSERT INTO reviews(user_id, location_id, food_quality, food_amount, service_quality, time_taken, extra_comments) VALUES($1, $2, $3, $4, $5, $6, $7)';
    const values = [1, locationId, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments];

    await pool.query(query, values);

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// API endpoint to get all ratings for a specific location
app.get('/api/ratings/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = 'SELECT * FROM reviews WHERE location_id = $1 ORDER BY created_at DESC';
    const values = [locationId];

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching ratings', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});