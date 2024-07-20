// Function to handle user signup
export async function getLocationPlace(req, res) {
  console.log(req.query.text);

  try {
    // Construct the URL with query parameters
    const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    url.searchParams.append("text", req.query.text); // The text input from the user
    url.searchParams.append("filter", "rect:68.1766,8.0985,97.4161,37.7885"); // Bounding box coordinates for India
    url.searchParams.append("limit", "20");
    url.searchParams.append("apiKey", "c4b3f16cfa1e4ec094c757a61161ff63");

    // Log the constructed URL for debugging
    console.log("Constructed URL:", url.toString());

    // Fetch data from the API
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text(); // Get the error text from the response
      throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log(data.features[0]);

    // Construct the result array
    const result = data.features.map(({ properties }) => ({
      address: properties.formatted,
      lat: properties.lat,
      lon: properties.lon,
      state: properties.state,
      postcode: properties.postcode,
      id: properties.place_id
    }));

    // Log the response data
    console.log(result);
    res.json(result); // Send only the response data
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch locations" });
  }
}
