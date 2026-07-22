import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }

    await connectionPool.query(
      "INSERT INTO assignments (title, content, category) VALUES ($1, $2, $3) RETURNING *",
      [title, content, category],
    );

    return res.status(201).json({ message: "Created assignment sucessfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.get("/assignments", async (req, res) => {
  try {
    const getData = await connectionPool.query("SELECT * FROM assignments");

    return res.status(200).json({ data: getData.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const getData = await connectionPool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [req.params.assignmentId],
    );

    if (getData.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }

    return res.status(200).json({ data: getData.rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const assignmentId = req.params.assignmentId;

    const getData = await connectionPool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [assignmentId],
    );

    if (getData.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to update" });
    }
    await connectionPool.query(
      "UPDATE assignments SET title = $1, content = $2, category = $3 WHERE id = $4",
      [title, content, category, assignmentId],
    );

    return res.status(200).json({ message: "Updated assignment successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const getData = await connectionPool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [assignmentId]
    );

    if (getData.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to delete" });
    }
    await connectionPool.query("DELETE FROM assignments WHERE id = $1", [
      assignmentId,
    ]);
    return res.status(200).json({ message: "Deleted assignment successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server could not delete assignment because database connection" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
