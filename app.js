const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");

app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));
app.use(fileupload());


// Route Imports

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/oderRoute");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);

// Middleware for error
app.use(errorMiddleware);

module.exports=app;