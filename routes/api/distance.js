const express = require('express')
const router = express.Router();
const request = require('request');
const metersToMiles = (meters) => (meters / 1609.344).toFixed(2);

// Example user input data
const schedule =
  {
    monday: [
      {
        name: 'Work',
        location: '16th and Market St. Philadelphia, PA',
        start: 9,
        end: 17,
      },
    ],
    tuesday: [
      {
        name: 'Work',
        location: '16th and Market St. Philadelphia, PA',
        start: 9,
        end: 17,
      },
    ],
    wednesday: [
      {
        name: 'Work',
        location: '16th and Market St. Philadelphia, PA',
        start: 9,
        end: 17,
      },
    ],
    thursday: [
      {
        name: 'Work',
        location: '16th and Market St. Philadelphia, PA',
        start: 9,
        end: 17,
      },
      {
        name: 'Seven Band Rehearsal',
        location: '974 Highland Ave. Langhorn PA',
        start: 18.5,
        end: 20,
      },
    ],
    friday: [
      {
        name: 'Work',
        location: '16th and Market St. Philadelphia, PA',
        start: 9,
        end: 17,
      },
      {
        name: 'Seven Band Gig',
        location: '974 Highland Ave. Langhorn PA',
        start: 18,
        end: 23,
      },
    ],
    saturday: [
      {
        name: 'Seven Band Gig',
        location: '974 Highland Ave. Langhorn PA',
        start: 15,
        end: 23,
      },
    ],
    sunday: [
      {
        name: 'Mags Waterfont',
        location: '9242 N Delaware Ave, Philadelphia, PA 19114',
        start: 17,
        end: 21,
      },
    ],
  };

// Make Google Maps API call
const key = process.env.GOOGLE_API_KEY;
let trip;
async function getDistance(origin, destination, callback) {
  console.log(`asking for google for ${origin} to ${destination}`);
  const query = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${key}`;
  await request(query, (error, response, body) => {
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    if (error) {
      console.log(error);
      return;
    }
    trip = JSON.parse(body).routes[0].legs[0];
    callback(metersToMiles(trip.distance.value), trip.duration.value);
  });
}
router.get('/', (req, res) => {
  const eventFrequencies = [];
  for (const key in schedule) {
    let day = schedule[key];
    day.forEach(event => {
      if (!eventFrequencies[event.location]) {
        eventFrequencies[event.location] = { event, frequency: 1};
      } else {
        if (eventFrequencies[event.location].start !== event.start && eventFrequencies[event.location].end !== event.end) {
          eventFrequencies[event.location] = { event, frequency: ++eventFrequencies[event.location].frequency};
        }
      }
    });
  }

  const home = '2949 Hamilton Ct Bensalem, PA 19020';
  let distances = [];  
  Object.values(eventFrequencies).forEach((place, i) => {
    getDistance(home, place.event.location, (distance, time) => {
      distances.push({
        'from': home,
        'to': place.event.location,
        'distance': (distance * place.frequency).toFixed(2),
        'time': (time * place.frequency / 3600).toFixed(2),
      });
      if (i == eventFrequencies.length) {
        res.json(distances);
        console.log(distances);
      }
    });
  });
});

module.exports = router;
