import { sind, cosd, rad2deg } from "./math.js";
import { JD_J2000 } from "./datetime.js";

/**
 * Converts osculating orbital elements to Cartesian coordinates.
 * @param {[number]} kepler Array containing the oribital elements 
 * @param {number} JD Julian Date of the epoch at which to calculate the body's position
 * @link https://ssd.jpl.nasa.gov/planets/approx_pos.html
 * @returns Position of the body at epoch JD relative to the J2000 ecliptic plane.
 */
export function kepler2xyz(kepler, JD) {
  // Get number of centuries past J2000
  let CT = (JD - JD_J2000) / 36525.0;

  // Compute first-order approximations for planetary orbital elements
  let a   = kepler[0] + kepler[6]*CT;  // Semi-major axis
  let e   = kepler[1] + kepler[7]*CT;  // Eccentricity
  let I   = kepler[2] + kepler[8]*CT;  // Inclination
  let L   = kepler[3] + kepler[9]*CT;  // Mean longitude
  let LP  = kepler[4] + kepler[10]*CT; // Longitude of perihelion
  let LAN = kepler[5] + kepler[11]*CT; // Longitude of the ascending node

  // Compute mean anomaly and clamp within -180 < M <= 180
  let omega = LP - LAN;
  let M = L - LP;

  if (M < -180) M += 360;
  if (M > 180) M -= 360;

  // Solve for eccentric anomaly
  let E = solveE(M, e);

  return kepler2ecliptic(a, e, I, omega, E, LAN);
}

/**
 * Compute the points along an orbit
 * @param {[number]} kepler Array containing the oribital elements 
 * @param {number} JD Julian Date of the epoch at which to calculate the body's position
 * @link https://ssd.jpl.nasa.gov/planets/approx_pos.html
 * @returns Returns an array of points describing the complete orbit 
 */
 export function keplerPoints(kepler, JD) {
  // Get number of centuries past J2000
  let CT = (JD - JD_J2000) / 36525.0;

  // Compute first-order approximations for planetary orbital elements
  let a   = kepler[0] + kepler[6]*CT;  // Semi-major axis
  let e   = kepler[1] + kepler[7]*CT;  // Eccentricity
  let I   = kepler[2] + kepler[8]*CT;  // Inclination
  let L   = kepler[3] + kepler[9]*CT;  // Mean longitude
  let LP  = kepler[4] + kepler[10]*CT; // Longitude of perihelion
  let LAN = kepler[5] + kepler[11]*CT; // Longitude of the ascending node

  // Compute mean anomaly and clamp within -180 < M <= 180
  const omega = LP - LAN;

  let points = [];
  for (let E = 0; E <= 360; E += 10) {
    points.push(kepler2ecliptic(a, e, I, omega, E, LAN));
  }

  return points;
}

/**
 * Converts orbital elements to position in the J2000 ecliptic plane
 * @param {number} a Semi-major axis (AU)
 * @param {number} e Eccentricity (unitless)
 * @param {number} I Inclination (degrees)
 * @param {number} omega Argument of perihelion (degrees)
 * @param {number} E Eccentric anomaly (degrees)
 * @param {number} LAN Longitude of the ascending node (degrees)
 * @returns Cartesian coordinates relative to the J2000 ecliptic plane
 */
function kepler2ecliptic(a, e, I, omega, E, LAN) {
  // Compute heliocentric coordinates in the orbital plane
  // (x-axis aligned to perihelion, z-axis perpendicular to orbital plane)
  let r = {
    x: a * (cosd(E) - e),
    y: a * Math.sqrt(1 - e * e) * sind(E),
    z: 0
  };

  // Converts the position in heliocentric coordinates (x-axis aligned to perihelion,
  // z-axis perpendicular to orbital plane) to J2000 ecliptic coordinates (x-axis 
  // aligned towards the equinox)
  let r_ecl = {
    x: (cosd(omega) * cosd(LAN) - sind(omega) * sind(LAN) * cosd(I)) * r.x +
      (-sind(omega) * cosd(LAN) - cosd(omega) * sind(LAN) * cosd(I)) * r.y,

    y: (cosd(omega) * sind(LAN) + sind(omega) * cosd(LAN) * cosd(I)) * r.x +
      (-sind(omega) * sind(LAN) + cosd(omega) * cosd(LAN) * cosd(I)) * r.y,

    z: (sind(omega) * sind(I)) * r.x +
       (cosd(omega) * sind(I)) * r.y
  };

  // Equations assume z-axis is orthogonal to the orbital plane. Three.js
  // uses y-axis as the vertical axis, so swap the coordinates.
  return { 
    x: r_ecl.x, 
    y: r_ecl.z, 
    z: -r_ecl.y 
  };
}

/**
 * Solves for the eccentric anomaly given the mean anomaly M
 * @param M {number} Mean anomaly (degrees)
 * @param e {number} Eccentricity (unitless)
 */
function solveE(M, e) {

  const e_star = rad2deg(e);

  // Tolerance for Newton-Rhapson
  const eps = 1E-6;
  // Eccentric anomaly at iteration J          
  let E_j = M - e_star * sind(M);
  // Eccentric anomaly at iteration J+1
  let E_jplus1 = 0;          

  let dM = 0;
  let dE = 0;
  let i = 0;

  do {
    // Find root of equation M(t) = E(t) - e * sin(E(t))
    dM = M - (E_j - e_star * sind(E_j));
    dE = dM / (1 - e * cosd(E_j));
    E_jplus1 = E_j + dE;
    E_j = E_jplus1;
    i++;
  } while (Math.abs(dE) > eps && i < 50);

  return E_j;
}