import mongoose from "mongoose";

export const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Base de datos conectada");
  } catch (error) {
    console.error("Error al conectar la base de datos", error);
    process.exit(1); 
  }
};
