import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Backend Running but not connected to frontend");
});

app.listen(PORT || 5000, () => {
  console.log(`Server started on port ${PORT} ...`);
  console.log(`http://localhost:${PORT}`);
  
});