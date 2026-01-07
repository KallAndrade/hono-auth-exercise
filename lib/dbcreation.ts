import { initializeDatabase } from "./db";

// create the table is it does not exist yet
await initializeDatabase()