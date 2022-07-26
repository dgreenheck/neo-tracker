import fetch from "node-fetch";
import { API_KEY } from "./constants.js";

export async function getNEOs(page) {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?page=${page}&size=20&api_key=${API_KEY}`);
  const data = await response.json();
  console.log(data);
  return data
}

/*
{
  "is_potentially_hazardous_asteroid": true,
  "is_sentry_object": true,
  "neo_reference_id": "string",
  "name": "string",
  "name_limited": "string",
  "designation": "string",
  "nasa_jpl_url": "string",
  "absolute_magnitude_h": 0,
  "estimated_diameter": {},
  "close_approach_data": [
    {
      "close_approach_date_full": "string",
      "close_approach_date": "string",
      "epoch_date_close_approach": 0,
      "relative_velocity": {},
      "miss_distance": {},
      "orbiting_body": "string"
    }
  ],
  "orbital_data": {},
  "sentry_data": "string"
}
*/