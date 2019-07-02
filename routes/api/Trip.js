class Trip {
  constructor(origin, destination, departure, frequency) {
    this.origin = origin;
    this.destination = destination;
    this.departure = departure;
    this.frequency = frequency;
    this.duration = 0;
    this.distance = 0;
  }
}

module.exports = Trip;
