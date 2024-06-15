module.exports = (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
      return res.status(400).send('Title and description are required');
  }
  next();
};
