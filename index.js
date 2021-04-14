const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfv4g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productsCollection = client.db("freshValley").collection("products");
  const ordersCollection = client.db("freshValley").collection("orders");

  app.post("/addOrder", (req, res) => {
    const newOrder = req.body;
    ordersCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newOrder);
  });

  app.get("/orders", (req, res) => {
    ordersCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/products", (req, res) => {
    productsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/product/:productKey", (req, res) => {
    const key = req.params.productKey;
    productsCollection.findOne({ productKey: key }).then((item) => {
      res.send(item);
    });
  });



  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    productsCollection.insertOne(newProduct).then((result) => {
      res.redirect('/')
    });
  });





  app.patch('/update/:id', (req, res) =>{
    // console.log(req.body)

    productsCollection.updateOne({_id: ObjectID(req.params.id)},
    {
      $set : { productName: req.body.productNewName, productPrice: req.body.productNewPrice }
    })
    .then(result =>{
      console.log(result);
    })
  })





  app.delete("/deleteProduct/:productId", (req, res) => {
    const id = ObjectID(req.params.productId)
    productsCollection.findOneAndDelete({ _id: id }) 
    .then((result) => {
      console.log(result); 
    }); 
   
  });

  app.delete("/deleteOrder/:productKey", (req, res) => {
    const key = (req.params.productKey)
    console.log(key)
    ordersCollection.findOneAndDelete({ productKey: key }) 
    .then((result) => {
      console.log(result); 
    }); 
   
  });


  



});

app.listen(port);
