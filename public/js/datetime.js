// Julian date for the J2000 epoch
export const JD_J2000 = 2451545.0;

// Returns the Julian Date for the given date
// date: number of milliseconds since January 1, 1970 00:00:00 UTC. 
export function date2jd(date) {
  return (date / 86400000) + 2440587.5;
}
