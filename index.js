const express = require("express");
const app = express();
app.get("/", (req, res) => {
  const domain = req.hostname;
  console.log(req.hostname, req.ip, req.ips);
  res.send(`Domain: ${domain}`);
});
const port = 7777;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
