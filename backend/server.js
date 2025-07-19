import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();
const app = express();

app.use(express.json());

//imports Route
import ProductRoutes from "./routes/ProductRoute.js"
import OrderRoutes from "./routes/OrderRoute.js"
import supplierRoutes from './routes/SupplierRoute.js';
import fabricRoutes from './routes/FabricRoute.js';
import eshraRoutes     from "./routes/EshraRoute.js";
import paintingRoutes  from "./routes/PaintingRoute.js";
import marbleRoutes    from "./routes/MarbleRoute.js";
import dehnatRoutes    from "./routes/DehnatRoute.js";



app.use((req,res,next) => {
  console.log(req.path,req.method)
  next()
})

// middleware
app.use('/api/Product', ProductRoutes);
app.use('/api/Order', OrderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/fabrics',    fabricRoutes);
app.use('/api/eshra',      eshraRoutes);
app.use('/api/paintings',  paintingRoutes);
app.use('/api/marbles',    marbleRoutes);
app.use('/api/dehnat',     dehnatRoutes);


//connect to mongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("🔗 MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));




//connect to port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server started at http://localhost:${PORT}`)
);
