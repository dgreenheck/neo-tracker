
// Julian date for the J2000 epoch
let JD_J2000 = 2451545.0;

let planets = {
  //  Below are osculating elements for the planets, given for epoch 2000 January 1.5 (i.e. Julian Day 2451545.0). 
  //  The elements are a least-squares fit to the 250-year span of the DE 200 planetary ephemeris to a Keplerian
  //  orbit, where each element is allowed to vary linearly with time. The resulting elements fit the positions
  //  of the terrestrial planets to within 25 arcseconds or better, but achieves only 10-arcminute accuracy for
  //  Saturn. Elements are referenced to mean ecliptic and equinox of J2000 at the J2000 epoch (2451545.0 JD). 
  //
  //  Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html
  //  
  //  Legend
  //    0 = a: Semimajor axis (AU)
  //    1 = e: Eccentricity
  //    2 = I: Inclination (deg)
  //    3 = L: Mean longitude at epoch (deg)
  //    4 = LP: Longitude of Perihelion (deg)
  //    5 = LAN: Longitude of Ascending Node (deg)
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

// Gets the position of the body in the J2000 ecliptic plane for the given epoch
function getBodyPosition(body, t_eph) {
  // Get number of centuries past J2000
  let CT = (t_eph - JD_J2000) / 36525.0;

  // Compute first-order approximations for planetary orbital elements
  let a   = body.orbit[0] + body.orbit[6]*CT;
  let e   = body.orbit[1] + body.orbit[7]*CT;
  let I   = body.orbit[2] + body.orbit[8]*CT;
  let L   = body.orbit[3] + body.orbit[9]*CT;
  let LP  = body.orbit[4] + body.orbit[10]*CT;
  let LAN = body.orbit[5] + body.orbit[11]*CT;

  // Compute mean anomaly and clamp within -180 < M <= 180
  let omega = LP - LAN;
  let M = L - LP;

  if (M < -180) M += 360;
  if (M > 180) M -= 360;

  // Solve for eccentric anomaly
  let E = solveE(M, e);

  // Compute heliocentric coordinates in the orbital plane
  // (x-axis aligned to perihelion, z-axis perpendicular to orbital plane)
  let r = {
    x: a * (cosd(E) - e),
    y: a * Math.sqrt(1 - e * e) * sind(E),
    z: 0
  };

  // Compute the coordinates in the J2000 ecliptic plane with the x-axis aligned toward the equinox
  let r_ecl = {
    x: ( cosd(omega)*cosd(LAN) - sind(omega)*sind(LAN)*cosd(I)) * r.x + 
       (-sind(omega)*cosd(LAN) - cosd(omega)*sind(LAN)*cosd(I)) * r.y,
    
    y: ( cosd(omega)*sind(LAN) + sind(omega)*cosd(LAN)*cosd(I)) * r.x + 
       (-sind(omega)*sind(LAN) + cosd(omega)*cosd(LAN)*cosd(I)) * r.y,

    z: (sind(omega)*sind(I)) * r.x +
       (cosd(omega)*sind(I)) * r.y
  }

  r_ecl = { x: r_ecl.x, y: r_ecl.z, z: -r_ecl.y };

  return r_ecl;
}

function getOrbitPoints(planet, t_eph) {
  // Get number of centuries past J2000
  const CT = (t_eph - JD_J2000) / 36525.0;

  // Compute first-order approximations for planetary orbital elements
  const a   = planet.orbit[0] + planet.orbit[6]*CT;
  const e   = planet.orbit[1] + planet.orbit[7]*CT;
  const I   = planet.orbit[2] + planet.orbit[8]*CT;
  const L   = planet.orbit[3] + planet.orbit[9]*CT;
  const LP  = planet.orbit[4] + planet.orbit[10]*CT;
  const LAN = planet.orbit[5] + planet.orbit[11]*CT;

  // Compute mean anomaly and clamp within -180 < M <= 180
  const omega = LP - LAN;

  let points = [];
  for (let E = 0; E <= 360; E += 10) {

    // Compute heliocentric coordinates in the orbital plane
    // (x-axis aligned to perihelion, z-axis perpendicular to orbital plane)
    let r = {
      x: a * (cosd(E) - e),
      y: a * Math.sqrt(1 - e * e) * sind(E),
      z: 0
    };

    // Compute the coordinates in the J2000 ecliptic plane with the x-axis aligned toward the equinox
    let r_ecl = {
      x: ( cosd(omega)*cosd(LAN) - sind(omega)*sind(LAN)*cosd(I)) * r.x + 
        (-sind(omega)*cosd(LAN) - cosd(omega)*sind(LAN)*cosd(I)) * r.y,
      
      y: ( cosd(omega)*sind(LAN) + sind(omega)*cosd(LAN)*cosd(I)) * r.x + 
        (-sind(omega)*sind(LAN) + cosd(omega)*cosd(LAN)*cosd(I)) * r.y,

      z: (sind(omega)*sind(I)) * r.x +
        (cosd(omega)*sind(I)) * r.y
    }

    r_ecl = { x: r_ecl.x, y: r_ecl.z, z: -r_ecl.y };

    points.push(r_ecl);
  }

  return points;
}

// Solves for the eccentric anomaly given the mean anomaly M
// Parameters
// - M: Mean anomaly (degrees)
// - e: Eccentricity (unitless)
function solveE(M, e) {

  const e_star = rad2deg(e);

  // Tolerance for Newton-Rhapson
  const eps = 1E-6;
  // Eccentric anomaly at iteration J          
  let E_j = M - e_star * sind(M);
  // Eccentric anomaly at iteration J+1
  let E_jplus1 = 0;          

  let i = 0;
  do {
    // Find root of equation M(t) = E(t) - e * sin(E(t))
    deltaM = M - (E_j - e_star * sind(E_j));
    deltaE = deltaM / (1 - e * cosd(E_j));
    E_jplus1 = E_j + deltaE;
    E_j = E_jplus1;
    i++;
  } while (Math.abs(deltaE) > eps && i < 50);

  return E_j;
}

/* Utilities */

// Returns the Julian Date for the given date
// date: number of milliseconds since January 1, 1970 00:00:00 UTC. 
function date2jd(date) {
  return (date / 86400000) + 2440587.5;
}

// Returns the cosine of an angle specified in degrees
function cosd(x) {
  return Math.cos(deg2rad(x));
}

// Returns the sine of an angle specified in degrees
function sind(x) {
  return Math.sin(deg2rad(x));
}

// Returns the signed arctangent of (x/y) in degrees
function atan2d(x,y) {
  return rad2deg(Math.atan2(x,y));
}

// Converts the argument from degrees to radians
function deg2rad(x) {
  return x / (180.0 / Math.PI);
}

// Converts the argument from radians to degrees
function rad2deg(x) {
  return x * (180.0 / Math.PI);
}