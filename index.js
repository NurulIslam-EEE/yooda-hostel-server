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
        const studentsCollection = client.db("yooda-hostel").collection("students");
        const distributionsCollection = client.db("yooda-hostel").collection("distributions");

        // save students api worked
        app.post('/student', async (req, res) => {
            const data = req.body;
            const result = await studentsCollection.insertOne(data);

            res.json(result);
        })
        // save users api worked
        app.post('/users', async (req, res) => {
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

        // add distribution worked
        app.post("/distribution", async (req, res) => {
            const distribution = req.body;

            const result = await distributionsCollection.insertOne(distribution);
            console.log(result);
            res.json(result);
        });

        //get students worked
        app.get('/students', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = studentsCollection.find({});
            const count = await cursor.count();
            let students;
            if (page) {
                students = await cursor.skip(page * size).limit(size).toArray();
            } else {
                students = await cursor.toArray();
            }

            res.send({ students, count });

        })
        // get foods collection worked
        app.get("/foods", async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = foodsCollection.find({});
            const count = await cursor.count();
            let foods;
            if (page) {
                foods = await cursor.skip(page * size).limit(size).toArray();
            } else {
                foods = await cursor.toArray();
            }

            res.send({ foods, count });
        });
        //get distributionsCollection worked
        app.get("/distributions", async (req, res) => {
            const cursor = distributionsCollection.find({});
            const distributions = await cursor.toArray();
            res.send(distributions);
        });


        // status update worked
        app.put('/students', async (req, res) => {
            const id = req.body.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };

            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await studentsCollection.updateOne(filter, updateDoc)

            res.json(result)
            console.log(status, id)
        })
        //delete foods worked
        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodsCollection.deleteOne(query);
            res.send(result);
        })
        //delete students worked
        app.delete('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.deleteOne(query);
            res.send(result);
        })

        //get single foods worked
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodsCollection.findOne(query);
            res.send(result);
        });

        // update food  worked
        app.put('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };

            const updateDoc = {
                $set: {
                    foodId: updatedProduct.id,
                    name: updatedProduct.name,
                    price: updatedProduct.price
                },
            };
            const result = await foodsCollection.updateOne(filter, updateDoc)
            console.log('updating', id)
            res.json(result)
        })

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