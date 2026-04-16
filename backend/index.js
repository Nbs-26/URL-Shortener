const express = require('express');
const route = require('./route');

const app = express();

app.use(express.json());

app.use("/api", route);

const port = 8000;
app.listen(port,()=>{
    console.log(`Server is listening on port : ${port}`);
})