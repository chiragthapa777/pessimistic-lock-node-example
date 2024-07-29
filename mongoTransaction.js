const express = require("express");
const mongoose = require("mongoose");
const { sleep } = require("./lib");
require("dotenv").config();

const uri = `mongodb://root:example@localhost:27016,localhost:27018,localhost:27019/test-db?replicaSet=rs0&authSource=admin`;

// Initialize Express app
const app = express();

app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Define Post model
const Post = mongoose.model("Post", {
  name: String,
  likeCount: { type: Number, default: 0 },
  tags: {
    type: [
      {
        name: {
          type: String,
        },
      },
    ],
  },
});
const User = mongoose.model("User", {
  username: {
    type: String,
    unique: true,
  },
});

app.get("", async (req, res) => {
  res.status(200).json({ data: "done" });
});

app.post("/post", async (req, res) => {
  try {
    console.log(req.body);
    const post = await Post.create(req.body);
    res.json({ message: "created", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/user", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    res.json({ message: "created", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json({ message: "created", posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: "created", users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/post/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log(req.params);
    const _id = req.params.id;
    const post = await Post.findById(_id).session();
    await sleep(8000);
    await Post.findOneAndUpdate(
      { _id },
      {
        $set: {
          name: post.name + " updated",
        },
      }
    ).session(session);
    await User.findOneAndUpdate(
      { _id: "66a760d4217169c6f3482055" },
      {
        $set: {
          username: post.name + " updated",
        },
      }
    ).session(session);
    throw "test"
    res.json({ message: "created", post });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
});

// Start the server
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
