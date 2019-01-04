// set background color to dark grey after sunset in toronto

const SunCalc = require('suncalc')

// get today's sunlight times for London
var times = SunCalc.getTimes(new Date(), 51.5, -0.1)

// format sunrise time from the Date object
var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes()

console.log(sunriseStr)
