import fetch from "node-fetch";
import { API_KEY } from "./constants.js";

export async function getStats() {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/stats?api_key=${API_KEY}`);
  const data = await response.json();
  console.log(data);
  return data
}

/*
{
  "near_earth_object_count": 0,
  "close_approach_count": 0,
  "last_updated": "string",
  "source": "string",
  "nasa_jpl_url": {}
}
*/