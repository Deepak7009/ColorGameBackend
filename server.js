const express = require('express');
const app = express();
const cors = require("cors");
const port = 5000;

const dbConnection = require("./config/dbConnection");
app.use(cors());
app.use(express.json());

dbConnection();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
