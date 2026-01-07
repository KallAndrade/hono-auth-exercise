import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
} else {
  console.log("Using DATABASE_URL:", DATABASE_URL);
}

export const sql = postgres(process.env.DATABASE_URL!);

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Coleagues" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR(255) NOT NULL
      )
    `
    console.log('Coleagues table created successfully')
  } catch (error) {
    console.error('Error creating Coleagues table:', error)
    throw error
  }
}

export async function findColegueByEmail(email: string) {
  try {
    console.log('Searching for user with email:', email)
    const result = await sql`
      SELECT * FROM "Coleagues" WHERE email = ${email}
    `
    console.log('Found user:', result[0])

    return result[0] || null
  } catch (error) {
    console.error('Error finding user by email:', error)
    throw error
  }
}

export async function findUserById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM "Coleagues" WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error('Error finding user by id:', error)
    throw error
  }
}

export async function createColegues(name: string, email: string, password: string, role: string) {
  try {
    const result = await sql`
      INSERT INTO "Coleagues" (name, email, password, role)
      VALUES (${name}, ${email}, ${password}, ${role})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function findAllColeagues() {
  try {
    const result = await sql`
      SELECT * FROM "Coleagues"
    `
    return result || null
  } catch (error) {
    console.error('Error finding user by email:', error)
    throw error
  }
}
