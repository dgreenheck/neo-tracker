// Returns the cosine of an angle specified in degrees
export function cosd(x) {
  return Math.cos(deg2rad(x));
}

// Returns the sine of an angle specified in degrees
export function sind(x) {
  return Math.sin(deg2rad(x));
}

// Returns the signed arctangent of (x/y) in degrees
export function atan2d(x,y) {
  return rad2deg(Math.atan2(x,y));
}

// Converts the argument from degrees to radians
export function deg2rad(x) {
  return x / (180.0 / Math.PI);
}

// Converts the argument from radians to degrees
export function rad2deg(x) {
  return x * (180.0 / Math.PI);
}