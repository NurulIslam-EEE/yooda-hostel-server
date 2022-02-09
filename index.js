const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;


const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0i8x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const foodsCollection = client.db("yooda-hostel").collection("foodss");
        const usersCollection = client.db("yooda-hostel").collection("users");
        const distributionsCollection = client.db("yooda-hostel").collection("distributions");

        // save students api worked
        app.post('/student', async (req, res) => {
            const data = req.body;
            const result = await usersCollection.insertOne(data);

            res.json(result);
        })
        // save food api worked
        app.post('/food', async (req, res) => {
            const food = req.body;

            const result = await foodsCollection.insertOne(food);
            console.log('new user data saved');
            res.json(result);
        })

        //post api for add distribution
        app.post("/distribution", async (req, res) => {
            const distribution = req.body;

            const result = await distributionsCollection.insertOne(distribution);
            console.log(result);
            res.json(result);
        });






        //update user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result)
            console.log(result);
        })

        //get
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })

        // app.get('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const result = await usersCollection.findOne(filter);

        //     res.json(result)
        // })

        // check user role admin or not 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log('admin : ', isAdmin, user);
            res.json(isAdmin);
        })
        //make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            if (user.role === 'user') {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);

                console.log('user role set to admin');

                const data = { result, role: 'admin' }
                res.json(data);
            }
            // console.log(user)
            else {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'user' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                console.log('user role set to user');
                const data = { result, role: 'user' }
                res.json(data);
            }
        })







        // blog collection
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find({});
            const blogs = await cursor.toArray();
            res.send(blogs);
        });
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
            res.send(result);
        })

        // rating update
        app.put('/rating', async (req, res) => {
            const id = req.body.id;
            const rating = req.body.blogRating;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    rating: rating
                },
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options)

            res.json(result)
            console.log(rating, id)
        })
        // GET API for show data
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find({});
            const blog = await cursor.toArray();
            res.send(blog);
        });
        //GET Dynamic (blog)
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.findOne(query);
            res.send(result);
        });
        // update
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBlogs = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: updatedBlogs.title,
                    description: updatedBlogs.description,
                    image: updatedBlogs.image,
                    location: updatedBlogs.location,
                    category: updatedBlogs.category,
                    cost: updatedBlogs.cost,
                    info: updatedBlogs.info
                },
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
        // update
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
        //update review status 
        app.put('/blogStatus/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: updatedStatus.status
                },
            };
            const result = await blogsCollection.updateOne(query, updatedDoc, options)
            res.json(result)
        })

        // GET API for show review
        app.get("/review", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });
        //update review status 
        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrders = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: updatedOrders.status
                },
            };
            const result = await reviewsCollection.updateOne(query, updatedDoc, options)
            res.json(result)
        })


    }
    finally {
        // await client.close();
    }
}








run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('yooda hostel!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})