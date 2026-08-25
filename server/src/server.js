import express from "express"
import cors from "cors"
import "dotenv/config"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import DB from "./config/db.js"
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js';


DB()

const app=express()
app.use(express.json())
app.use(helmet())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))


app.get("/api/health",(req,res)=>{
    res.status(200).json({status:"ok"})
})
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes);

const PORT=process.env.PORT ||5000
app.listen(PORT,()=>{
    console.log("server is running")
})