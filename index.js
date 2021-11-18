const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;

const { MongoClient } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tchpt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("best-travel");
    const packagesCollection = database.collection("packages");
    console.log("Travel Database Connection Successful");

    // Get All PACKAGES Data
    app.get("/packages", async (req, res) => {
      const cursor = packagesCollection.find({});
      const count = await cursor.count();
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let packages;
      if (page) {
        packages = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        packages = await cursor.toArray();
      }
      res.send({
        count,
        packages,
      });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Best Travel!");
});

app.listen(port, () => {
  console.log(`Running Server on ${port}`);
});
