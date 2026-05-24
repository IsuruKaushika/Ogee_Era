import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';

import orderRouter from './routes/orderRoute.js';

//import routes

const app = express();
const port = process.env.PORT || 4000;
connectCloudinary()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

// Ensure DB is ready before every request (handles serverless cold starts)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(503).json({ success: false, message: 'Service temporarily unavailable. Please try again.' });
    }
});

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req, res) => {
    res.send('API Working')

})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})