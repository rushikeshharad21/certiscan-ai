import mongoose from "mongoose"

const connectionDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI)
        console.log(`connection: ${conn.connection.host}`)
    }
    catch(error){
        console.log(`error ${error.message}`)
        process.exit(1)
    }
}
export default connectionDB