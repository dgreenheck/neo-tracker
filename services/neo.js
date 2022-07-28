import fetch from "node-fetch";

const API_KEY = 'FFC0JnnKaajEFMhjppfHhvS5sbkH9JFvzW7XmYgr';

export async function getTodayNEOs() {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=false&api_key=${API_KEY}`);
  const data = await response.json();
  return data
}

export async function getNEOs(page) {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?page=${page}&size=20&api_key=${API_KEY}`);
  const data = await response.json();
  return data
}

export async function getNEO(id) {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${API_KEY}`);
  console.log(response);
  const data = await response.json();
  return data
}

export async function getStats() {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/stats?api_key=${API_KEY}`);
  const data = await response.json();
  return data
}