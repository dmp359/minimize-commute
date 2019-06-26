const express = require('express')
const router = express.Router();
const request = require('request');
const metersToMiles = (meters) => (meters / 1609.344).toFixed(2);
const secondsAtHour = (hour) => {
  const dt = new Date();
  dt.setHours(24 + hour); // TODO: Consider day of week
  return Math.round(dt.getTime() / 1000);
};

// Example user input data
const schedule =
  {
    monday: [
      {
        name: 'Work',
        location: 'Old City Philadelphia, PA',
        start: 8,
        end: 17,
      },
    ],
    tuesday: [
      {
        name: 'Work',
        location: 'Old City Philadelphia, PA',
        start: 8,
        end: 17,
      },
    ],
    wednesday: [
      {
        name: 'Work',
        location: 'Old City Philadelphia, PA',
        start: 8,
        end: 17,
      },
    ],
    thursday: [
      {
        name: 'Work',
        location: 'Old City Philadelphia, PA',
        start: 8,
        end: 17,
      },
      {
        name: 'Seven Band Rehearsal',
        location: '974 Highland Ave. Langhorn PA',
        start: 17,
        end: 20,
      },
    ],
    friday: [
      {
        name: 'Work',
        location: 'Old City Philadelphia, PA',
        start: 8,
        end: 17,
      },
      {
        name: 'Seven Band Gig',
        location: '974 Highland Ave. Langhorn PA',
        start: 17,
        end: 23,
      },
    ],
    saturday: [
      {
        name: 'Seven Band Gig',
        location: '974 Highland Ave. Langhorn PA',
        start: 16,
        end: 23,
      },
    ],
    sunday: [
      {
        name: 'Seven Band Acoustic Gig',
        location: '9242 N Delaware Ave, Philadelphia, PA 19114',
        start: 16,
        end: 21,
      },
    ],
  };

// Make Google Maps API call
const key = process.env.GOOGLE_API_KEY;
let trip;
async function getDistance(origin, destination, departure, callback) {
  console.log(`asking for google for ${origin} to ${destination} at time ${departure}`);
  const query = `https://maps.googleapis.com/maps/api/directions/json?\
origin=${origin}&\
destination=${destination}&\
mode=driving&\
departure_time=${departure}&\
key=${key}`;
  await request(query, (error, response, body) => {
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    if (error) {
      console.log(error);
      return;
    }
    trip = JSON.parse(body).routes[0].legs[0];
    callback(metersToMiles(trip.distance.value), trip.duration_in_traffic.value);
  });
}
router.get('/', (req, res) => {
  const eventFrequencies = [];

  // Aggregate all duplicate events to later avoid making duplicate API calls
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
  const home = req.query.home;
  let distances = [];  
  let completedCounter = 0; // To make sure all events are processed before returning
  const events = Object.values(eventFrequencies);
  events.forEach((place) => {
    getDistance(home, place.event.location, secondsAtHour(place.event.start), (distance, time) => {
      distances.push({
        'from': home,
        'to': place.event.location,
        'distance': (distance * place.frequency).toFixed(2),
        'time': (time * place.frequency / 3600).toFixed(2),
      });
      completedCounter++;
      if (completedCounter == events.length) {
        res.json(distances);
      }
    });
  });
});

module.exports = router;
