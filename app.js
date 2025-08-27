import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: 'https://selenecare.in',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true, // ✅ allow cookies to be sent
    optionsSuccessStatus: 200,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'device-remember-token', 
      'Origin', 
      'Accept'
    ]
  })
);


app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes

import userRouter from "./routes/user.routes.js";
import appConfigRouter from './routes/appConfig.routes.js'
import cartRouter from './routes/cart.routes.js'
import categoryRouter from './routes/category.routes.js'
import orderRouter from './routes/order.routes.js'
import productRouter from './routes/product.routes.js'
import reviewRouter from './routes/review.routes.js'
import couponRouter from './routes/coupon.routes.js'



app.use("/api/v1/app", appConfigRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/order", orderRouter);
app.use('/api/v1/product', productRouter)
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/coupon', couponRouter)
export { app };
