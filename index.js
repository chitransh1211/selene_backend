
import connectDB from "./db/index.js";
import {app} from './app.js'




connectDB()
.then(() => {
    app.listen(8000, "0.0.0.0", () => {
        console.log(`⚙️ Server is running at port : 8000`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})