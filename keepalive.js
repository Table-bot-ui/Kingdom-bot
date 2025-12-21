import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Bot is online ✅");
});

app.listen(3000, () => {
  console.log("Keep-alive server running on port 3000");
});