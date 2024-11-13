import fetch from 'node-fetch'; // Make sure to install node-fetch

const imageProxyMiddleware = async (req, res, next) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    // Fetch the image from the external URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch the image");
    }

    // Set the correct content type for the image
    res.setHeader("Content-Type", response.headers.get("content-type"));
    
    // Pipe the image response to the client
    response.body.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
};

export default imageProxyMiddleware;
