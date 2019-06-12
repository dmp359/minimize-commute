const express = require('express')
const router = express.Router();

const request = require('request');

const metersToMiles = (meters) => (meters / 1609.344).toFixed(2);

// Make Google Maps API call
const key = process.env.GOOGLE_API_KEY;
function getDistance(origin, destination, callback) {
  const query = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}mode=driving&key=${key}`;
  request(query, (error, response, body) => {
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    if (error) {
      console.log(error);
    }
    callback(metersToMiles(JSON.parse(body).routes[0].legs[0].distance.value));
  });
}

router.get('/', (req, res) => {
  getDistance('Atlantic City NJ', 'Philadelphia, PA', (distance) => {
    res.json(`${distance} miles`);
  });
});
 
module.exports = router;
