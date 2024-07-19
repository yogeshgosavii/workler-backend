
// Function to handle user signup
export async function getlocationPlace(req, res) {
  try {
    const response = await axios.get("https://api.geoapify.com/v2/places", {
      params: {
        categories: "city",
        filter: "countrycode:us",
        limit: 100,
        apiKey: "YOUR_API_KEY",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
}
