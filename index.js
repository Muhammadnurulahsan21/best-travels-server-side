const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const { MongoClient } = require("mongodb");
const objectId = require("mongodb").ObjectId;

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
    const bookingsCollection = database.collection("bookings");
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

    app.get("/bookings", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        const query = { email: email };
        const cursor = bookingsCollection.find(query);
        const orders = await cursor.toArray();
        res.json(orders);
      } else {
        const cursor = bookingsCollection.find({});
        const orders = await cursor.toArray();
        res.json(orders);
      }

    });

    // Add BOOKINGS API
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.json(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await bookingsCollection.find(filter).toArray();
      res.send(result);
    });

    // cancel an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.json(result);
    });

  

    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const packages = await packagesCollection.findOne(query);
      res.json(packages);
    });

    app.post("/packages", async (req, res) => {
      const packages = req.body;
      const result = await packagesCollection.insertOne(packages);
      res.json(result);
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
