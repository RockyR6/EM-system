import mongoose, { mongo } from "mongoose";


const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        await mongoose.connect(process.env.MONGOOSE_URI)
    } catch (error) {
        console.error('Database connection failed:', error.message)
    }
}

export default connectDB;