
// Julian date for the J2000 epoch
let JD_J2000 = 2451545.0;

let planets = {
  //  Below are osculating elements for the planets, given for epoch 2000 January 1.5 (i.e. Julian Day 2451545.0). 
  //  The elements are a least-squares fit to the 250-year span of the DE 200 planetary ephemeris to a Keplerian orbit,
  //  where each element is allowed to vary linearly with time. The resulting elements fit the positions of the terrestrial 
  //  planets to within 25 arcseconds or better, but achieves only 10-arcminute accuracy for Saturn. Elements are 
  //  referenced to mean ecliptic and equinox of J2000 at the J2000 epoch (2451545.0 JD). 
  //
  //  Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html
  //  
  //  Legend
  //    0 = Semimajor axis (AU)
  //    1 = Eccentricity
  //    2 = Inclination (deg)
  //    3 = Mean longitude at epoch (deg)
  //    4 = Longitude of Perihelion (deg)
  //    5 = Longitude of Ascending Node (deg)
  //    6 - 11 = derivates of 0 - 5 (units/century)

  mercury: {
    diameter: 4879,
    color: 0xE837AF,
    orbit: [0.38709927,0.20563593,7.00497902,252.2503235,77.45779628,48.33076593,0.00000037,0.00001906,-0.00594749,149472.6741,0.16047689,-0.12534081],
  },
  venus: {
    diameter: 12104,
    color: 0x8E68C5,
    orbit: [0.72333566,0.00677672,3.39467605,181.9790995,131.6024672,76.67984255,0.0000039,-0.00004107,-0.0007889,58517.81539,0.00268329,-0.27769418],
  },
  earth: {
    diameter: 12756,
    color: 0x4FB4FA,
    orbit: [1.00000261,0.01671123,-0.00001531,100.4645717,102.9376819,0,0.00000562,-0.00004392,-0.01294668,35999.37245,0.32327364,0],
  },
  mars: {
    diameter: 3934,
    color: 0xE94D23,
    orbit: [1.52371034,0.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,0.00001847,0.00007882,-0.00813131,19140.30268,0.44441088,-0.29257343],
  },
  jupiter: {
    diameter: 142984,
    color: 0xF09C33,
    orbit: [5.202887,0.04838624,1.30439695,34.39644051,14.72847983,100.4739091,-0.00011607,-0.00013253,-0.00183714,3034.746128,0.21252668,0.20469106],
  },
  saturn: {
    diameter: 120536,
    color: 0xF1FE52,
    orbit: [9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.6624245,-0.0012506,-0.00050991,0.00193609,1222.493622,-0.41897216,-0.28867794],
  },
  uranus: {
    diameter: 51118,
    color: 0x74F99C,
    orbit: [19.18916464,0.04725744,0.77263783,313.2381045,170.9542763,74.01692503,-0.00196176,-0.00004397,-0.00242939,428.4820279,0.40805281,0.04240589],
  },
  neptune: {
    diameter: 49529,
    color: 0x93C7EB,
    orbit: [30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.7842257,0.00026291,0.00005105,0.00035372,218.4594533,-0.32241464,-0.00508664]
  }
}

// Returns the Julian Date for the given date
function date2jd(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Gets the position of the planet in the J2000 ecliptic plane for the given epoch
function getPlanetPosition(planet, t_eph) {
  // Get number of centuries past J2000
  let T = (t_eph - JD_J2000) / 36525.0;

  // Compute first-order approximations for planetary orbital elements
  let a   = planet.orbit[0] + planet.orbit[6]*T;
  let e   = planet.orbit[1] + planet.orbit[7]*T;
  let I   = planet.orbit[2] + planet.orbit[8]*T;
  let L   = planet.orbit[3] + planet.orbit[9]*T;
  let LP  = planet.orbit[4] + planet.orbit[10]*T;
  let LAN = planet.orbit[5] + planet.orbit[11]*T;
  
  // Compute mean anomaly and clamp within -180 < M <= 180
  let omega = LP - LAN;
  let M = L - LP;
  
  if (M < -180) M += 360;
  if (M > 180) M -= 360;

  // Solve for eccentric anomaly
  let E = solveE(M, rad2deg(e));

  // Compute heliocentric coordinates in the orbital plane
  // (x-axis aligned to perihelion, z-axis perpendicular to orbital plane)
  let r = {
    x: a * (cosd(E) - e),
    y: a * Math.sqrt(1 - e * e) * sind(E),
    z: 0
  };

  // Compute the coordinates in the J2000 ecliptic plane with the x-axis aligned toward the equinox
  let r_ecl = {
    x: (cosd(omega)*cosd(LAN) - sind(omega)*sind(LAN)*cosd(I)) * r.x + (-sind(omega)*cosd(LAN) - cosd(omega)*sind(LAN)*cosd(I)) * r.y,
    y: (cosd(omega)*sind(LAN) - sind(omega)*cosd(LAN)*cosd(I)) * r.x + (-sind(omega)*sind(LAN) + cosd(omega)*cosd(LAN)*cosd(I)) * r.y,
    z: sind(omega)*sind(I) * r.x + cosd(omega)*sind(I) * r.y
  }

  return r_ecl;
}

function kepler2cartesian(a, e, i, omega, Omega, M) {

  // Use Newton-Rhapson to find the eccentric anomaly
  let E = solveE(M, e) / (180.0 / Math.PI);

  // Directly solve for the true anomaly
  let v = 2 * atan2d(
    Math.sqrt(1 + e) * sind(E / 2),
    Math.sqrt(1 - e) * cosd(E / 2)
  )

  // Get distance to the central body
  let rc = a * (1 - e * cosd(E));

  // Return position in orbital frame
  // X: Pointing towards periapsis of orbit
  // Y: Complete RH coordinate frame
  // Z: Perpendicular to orbital plane
  return {
    x: rc * cosd(v),
    y: rc * sind(v),
    z: 0
  };
}

// Solves for the eccentric anomaly given the mean anomaly M
// Parameters
// - M: Mean anomaly (degrees)
// - e: Eccentricity (unitless)
function solveE(M, e) {

  let eps = 1E-6;               // Tolerance for Newton-Rhapson
  let i = 0;                    // Iteration
  let E_j = M - e * sind(M);    // Eccentric anomaly at iteration J
  let E_jplus1 = E_j;           // Eccentric anomaly at iteration J+1

  do {
    // Find root of equation M(t) = E(t) - e * sin(E(t))
    deltaM = M - (E_j - e * sind(E_j));
    deltaE = deltaM / (1 - e * cosd(E_j));
    E_jplus1 = E_j + deltaE;
    E_j = E_jplus1;
    i++;
  } while (deltaE > eps && i < 50);

  return E_j;
}

function cosd(x) {
  return Math.cos(deg2rad(x));
}

function sind(x) {
  return Math.sin(deg2rad(x));
}

function atan2d(x,y) {
  return rad2deg(Math.atan2(x,y));
}

function deg2rad(x) {
  return x / (180.0 / Math.PI);
}

function rad2deg(x) {
  return x * (180.0 / Math.PI);
}