const express = require("express");
const commandHandler = require("./telegram/commandHandler");
const messageHandler = require("./telegram/messageHandler");
const callbackHandler = require("./telegram/callbackHandler");
const ROUTER = require("./router");
const app = express();
const http = require("http").Server(app);

commandHandler;
messageHandler;
callbackHandler;
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", ROUTER);

http.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING IN PORT ${PORT}`);
});
