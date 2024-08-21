const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors module
const pool = require('./dbconfig'); // Import the PostgreSQL connection pool (make sure that the databse info is not in the GitHub repo!)

const app = express();
const port = 3001;

app.use(cors()); // Use cors middleware to enable CORS
app.use(express.json({ limit: '50mb' })); // Make the app use JSON and set the limit to 50mb

app.use(bodyParser.json());

// API endpoint to get all locations
app.get('/api/chipotle-locations', async (req, res) => {
  try {
    const query = 'SELECT * FROM locations';

    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching locations', error);
    res.status(500).json({ message: 'Error fetching locations' });
  }
});

// API endpoint to handle rating submissions
app.post('/api/submit-rating', async (req, res) => {
  console.log(req.body);
  const { locationId, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments, foodImageType, foodImageName, foodImageBytes, userId } = req.body;

  try {
    const query = 'INSERT INTO reviews(user_id, location_id, food_quality, food_amount, service_quality, time_taken, extra_comments, image_type, image_name, image_data) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    const values = [userId, locationId, foodQuality, foodAmount, serviceQuality, timeTaken, extraComments, foodImageType, foodImageName, foodImageBytes];

    await pool.query(query, values);

    res.status(200).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// API endpoint to update the average rating of a location
app.post('/api/average-rating/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = `
      UPDATE locations
      SET
        average_rating = (
          SELECT AVG((food_quality + food_amount + service_quality) / 3.0)
          FROM reviews
          WHERE location_id = $1
        )
      WHERE id = $1;
    `;
    const values = [locationId];

    const results = await pool.query(query, values);

    res.status(200).json({ message: 'Average rating updated successfully' , success: true });
  } catch (error) {
    console.error('Error updating rating', error);
    res.status(500).json({ message: 'Error updating rating' });
  }
});

// API endpoint to get the average rating of a location
app.get('/api/average-rating/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = 'SELECT average_rating FROM locations WHERE id = $1';
    const values = [locationId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location not found' });
    } else {
      res.status(200).json({ average_rating: result.rows[0].average_rating });
    }
  } catch (error) {
    console.error('Error fetching average rating', error);
    res.status(500).json({ message: 'Error fetching average rating' });
  }
});

// API endpoint to get all ratings for a specific location
app.get('/api/ratings/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = `
      SELECT reviews.*, locations.name AS location_name
      FROM reviews
      JOIN locations ON reviews.location_id = locations.id
      WHERE reviews.location_id = $1
      ORDER BY created_at DESC;
    `;
    const values = [locationId];

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching ratings', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// API endpoint to get the latitude, longitude, and name of a specific location
app.get('/api/location/:locationId', async (req, res) => {
  const { locationId } = req.params;

  try {
    const query = 'SELECT latitude, longitude, name FROM locations WHERE id = $1';
    const values = [locationId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location not found' });
    } else {
      const { latitude, longitude, name } = result.rows[0];
      res.status(200).json({ values: {latitude, longitude, name}, success: true  });
    }
  } catch (error) {
    console.error('Error fetching location', error);
    res.status(500).json({ message: 'Error fetching location' });
  }
});

// API endpoint to get homelocation of a specific user
app.get('/api/home-location/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = 'SELECT location_id FROM home_locations WHERE user_id = $1';
    const values = [userId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Home location not found', success: false });
    } else {
      res.status(200).json({ locationId: result.rows[0].location_id, success: true });
    }
  } catch (error) {
    console.error('Error fetching home location', error);
    res.status(500).json({ message: 'Error fetching home location' });
  }
});

// API endpoint to get all the reviews of a specific user
app.get('/api/user-reviews/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT reviews.*, locations.name AS location_name
      FROM reviews
      JOIN locations ON reviews.location_id = locations.id
      WHERE reviews.user_id = $1;
    `;
    const values = [userId];

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user reviews', error);
    res.status(500).json({ message: 'Error fetching user reviews' });
  }
});

// API endpoint to handle account creation
app.post('/api/create-account', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    const query = 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3)';
    const values = [username, email, password];

    await pool.query(query, values);

    res.status(200).json({ message: 'Account created successfully', success: true });
  } catch (error) {
    console.error('Error creating account', error);
    res.status(500).json({ message: 'Error creating account', success: false });
  }
});

// API endpoint to handle account sign-in
app.post('/api/sign-in', async (req, res) => {
  const { email, password } = req.body;

  try {
    let query = 'SELECT * FROM users WHERE email = $1';
    let values = [email];

    let result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(200).json({ message: 'No account with email', success: false });
    }

    query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
    values = [email, password];

    result = await pool.query(query, values);
    
    if (result.rows.length === 1) {
      res.status(200).json({ message: 'Login successful', success: true, username: result.rows[0].username, user_id: result.rows[0].id});
    } else {
      res.status(401).json({ message: 'Login failed, wrong password', success: false });
    }
  } catch (error) {
    console.error('Error logging in', error);
    res.status(500).json({ message: 'Error logging in', success: false });
  }
});

// Set the home location
app.post('/api/set-home-location', async (req, res) => {
  const { locationId, userId } = req.body;

  try {
    const query = `
      INSERT INTO home_locations (user_id, location_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET location_id = EXCLUDED.location_id;
    `;
    const values = [userId, locationId];

    await pool.query(query, values);

    res.status(200).json({ message: 'Home location set successfully', success: true });
  } catch (error) {
    console.error('Error setting home location', error);
    res.status(500).json({ message: 'Error setting home location', success: false });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});