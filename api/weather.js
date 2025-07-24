export default async function handler(req, res) {
  const { type, lat, lon, q, units } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  let url = "";

  if (type === "weather") {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
  } else if (type === "geo") {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${apiKey}`;
  } else if (type === "reverse") {
    url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
  } else {
    return res.status(400).json({ error: "Invalid request type" });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
}