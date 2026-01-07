import { Hono } from 'hono'
import { createColegues as createColegue, findAllColeagues, findColegueByEmail as findColegueaByEmail, initializeDatabase, sql } from '../lib/db'
import { generateToken } from './auth'
import { authMiddleware } from './auth-middleware'
import { hash, compare } from "bcrypt";

type User = {
  id: string
  email: string
  password: string
}

const app = new Hono()

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Pirilamos a caminho!!!' }, 500)
})



app.get('/', (c) => {
  return c.text('Hono working!')
})

app.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()

  console.log('Login request received for email:', email)
  const user = await findColegueaByEmail(email)
  console.log('Login request received for email:', email)

  if (!user) {
    return c.json({ error: 'User does not exist' }, 404)
  }
  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await generateToken({ sub: user.id, email: user.email })

  return c.json({ message: 'Login successful', token })
})

app.post('/signup', async (c) => {
  const { email, password, name, role } = await c.req.json<{ email: string; password: string; name: string; role: string }>()

  console.log('Signup request received for email:', email)

  // const existingUser = await findUserByEmail(email)
  // if (existingUser) {
  //   return c.json({ error: 'User already exists' }, 409)
  // }

  console.log('Create coleague:', { name, email, role })

  const hashedPassword = await hash(password, 10);
  try {
    const createdUser = await createColegue(name, email, hashedPassword, role);

    const token = await generateToken({ sub: createdUser.id, email: createdUser.email })

    return c.json({ message: 'Login successful', token })
  } catch (error) {
    console.error('Error creating user:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Protected route
app.get('/me', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({
    message: 'Authenticated!',
    user
  })
})

app.get('/coleagues', async (c) => {
  try {
    const coleagues = await findAllColeagues()
    return c.json({ coleagues })
  } catch (error) {
    console.error('Error fetching coleagues:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
