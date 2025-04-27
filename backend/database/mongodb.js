import mongoose from "mongoose";
import { NODE_ENV,DB_URI } from "../config/env.js";

if (!DB_URI){
    throw new Error('Please define the MONGODB_URI environment variable inside .env.<development/production>.local');
}

const connecttoDatabase = async ()=>{
    try{
        await mongoose.connect(DB_URI);
        console.log(`MONGODB conncetion is Successful and in ${NODE_ENV} mode`);
        
    }catch(error){
        console.log('Error connecting to database: ',error);
        
        process.exit(1);
    }
}

export default connecttoDatabase;