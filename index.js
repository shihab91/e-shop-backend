const express = require("express");
const cors = require("cors"); //cors for own server connected with own
const { MongoClient } = require("mongodb");
var ObjectId = require("mongodb").ObjectId;
const app = express();
require("dotenv").config(); //dotenv config
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bvkvy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// Replace the uri string with your MongoDB deployment's connection string.
const client = new MongoClient(uri);
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("e-shop");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    // save a user to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      await usersCollection.insertOne(user);
      res.json({ message: "User added" });
    });
    // get the products for men
    app.get("/men", async (req, res) => {
      const products = await productsCollection
        .find({ category: "tshirt" })
        .toArray();
      res.json(products);
    });
    app.get("/shirts", async (req, res) => {
      const shirts = await productsCollection
        .find({ category: "shirt" })
        .toArray();
      res.json(shirts);
    });
    // get single product from the productsCollection
    app.get("/products/:id", async (req, res) => {
      const product = await productsCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.json(product);
    });
    // save a order to the db
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    // get a users orderd products from the orderCollection by users email
    app.get("/orders/:email", async (req, res) => {
      const orders = await orderCollection
        .find({ useEmail: req.params.email })
        .toArray();
      res.json(orders);
    });
    // get all orders from the orderCollection
    app.get("/orders", async (req, res) => {
      const orders = await orderCollection.find({}).toArray();
      res.json(orders);
    });
    // delete a order from the orderCollection by query
    app.delete("/orders", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: req.query.id,
      });
      res.send(result);
    });
    // get the admin from the db
    app.get("/users/:email", async (req, res) => {
      const user = await usersCollection.findOne({ email: req.params.email });
      let admin = false;
      if (user?.role === "admin") {
        admin = true;
      }
      res.json({ admin: admin });
    });
    // make an admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Server is ok");
});

app.listen(port, () => {
  console.log("Port is Ok", port);
});
