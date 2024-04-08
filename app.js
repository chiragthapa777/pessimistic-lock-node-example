const express = require("express");
const mongoose = require("mongoose");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Initialize Express app
const app = express();

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const sequelize = new Sequelize(process.env.PG_URL);
const PostPg = sequelize.define(
  "posts",
  {
    name: {
      type: DataTypes.STRING,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// Define Post model
const Post = mongoose.model("Post", {
  name: String,
  likeCount: { type: Number, default: 0 },
});

// Increase like count route
app.get("/posts/like/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likeCount++;
    await post.save();
    res.json({ message: "Like count increased successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// will not work as we want, references https://www.mongodb.com/docs/manual/core/write-operations-atomicity/#concurrency-control
// have to use find and modify
app.get("/posts/like/transaction/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).session(session);
    if (!post) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Post not found" });
    }
    post.likeCount++;
    await post.save();
    await session.commitTransaction();
    session.endSession();
    res.json({ message: "Like count increased successfully", post });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/pg/posts/like/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostPg.findByPk(postId);
    if (!post) {
      await t.rollback();
      return res.status(404).json({ message: "Post not found" });
    }
    await PostPg.update(
      { likeCount: post.likeCount + 1 }, // New data to update
      { where: { id: post.id } } // Condition to find records to update and attach the transaction
    );
    res.json({ message: "Like count increased successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Increase like count route with transaction
app.get("/pg/posts/like/transaction/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const postId = req.params.id;
    const post = await PostPg.findByPk(postId, { transaction: t, lock: true });
    if (!post) {
      await t.rollback();
      return res.status(404).json({ message: "Post not found" });
    }
    await PostPg.update(
      { likeCount: post.likeCount + 1 }, // New data to update
      { where: { id: post.id }, transaction: t } // Condition to find records to update and attach the transaction
    );
    await t.commit();
    res.json({ message: "Like count increased successfully", post });
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("", (req, res) => {
  res.send("App is running");
});

// Start the server
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * for typeorm
 *  const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const data = await queryRunner.manager
        .createQueryBuilder(DecorationVariantEntity, 'v')
        .useTransaction(true)
        .setLock('pessimistic_write') <-- there are lot of options reference here https://typeorm.io/select-query-builder#lock-modes
        .where('id = :id', { id: 12 })
        .getOne();
      if (!data) {
        throw new Error('NotFound');
      }
      data.count += 1;
      await this.variantRepo._update(data, {
        entityManager: queryRunner.manager,
      });
      await queryRunner.commitTransaction();
      return { data };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
 */
