import { createClient } from '@libsql/client'

export interface Suggestion {
  userName: string
  babyName: string
  meaning: string
  voteCount: number
}

// Initialize Turso client
function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
  }

  return createClient({
    url,
    authToken,
  })
}

// Initialize database table if it doesn't exist
async function initializeDatabase() {
  const client = getTursoClient()
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userName TEXT NOT NULL,
      babyName TEXT NOT NULL,
      meaning TEXT NOT NULL,
      voteCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// Read all suggestions from Turso
export async function readSuggestions(): Promise<Suggestion[]> {
  try {
    await initializeDatabase()
    const client = getTursoClient()
    
    const result = await client.execute('SELECT userName, babyName, meaning, voteCount FROM suggestions ORDER BY createdAt DESC')
    
    return result.rows.map((row) => ({
      userName: row.userName as string,
      babyName: row.babyName as string,
      meaning: row.meaning as string,
      voteCount: (row.voteCount as number) || 0,
    }))
  } catch (error) {
    console.error('Error reading suggestions from Turso:', error)
    return []
  }
}

// Append a new suggestion to Turso
export async function appendSuggestion(
  suggestion: Omit<Suggestion, 'voteCount'>
): Promise<void> {
  try {
    await initializeDatabase()
    const client = getTursoClient()
    
    await client.execute({
      sql: 'INSERT INTO suggestions (userName, babyName, meaning, voteCount) VALUES (?, ?, ?, ?)',
      args: [suggestion.userName, suggestion.babyName, suggestion.meaning, 0],
    })
  } catch (error) {
    console.error('Error appending suggestion to Turso:', error)
    throw error
  }
}

// Check if a baby name already exists (case-insensitive)
export async function nameExists(babyName: string): Promise<boolean> {
  try {
    await initializeDatabase()
    const client = getTursoClient()
    
    const result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM suggestions WHERE LOWER(TRIM(babyName)) = LOWER(TRIM(?))',
      args: [babyName],
    })
    
    const count = result.rows[0]?.count as number || 0
    return count > 0
  } catch (error) {
    console.error('Error checking name existence in Turso:', error)
    return false
  }
}

// Update vote count for a specific baby name
export async function updateVoteCount(
  babyName: string
): Promise<number | null> {
  try {
    await initializeDatabase()
    const client = getTursoClient()
    
    // First, get the current vote count
    const selectResult = await client.execute({
      sql: 'SELECT voteCount FROM suggestions WHERE LOWER(TRIM(babyName)) = LOWER(TRIM(?))',
      args: [babyName],
    })
    
    if (selectResult.rows.length === 0) {
      return null
    }
    
    const currentVoteCount = (selectResult.rows[0].voteCount as number) || 0
    const newVoteCount = currentVoteCount + 1
    
    // Update the vote count
    await client.execute({
      sql: 'UPDATE suggestions SET voteCount = ? WHERE LOWER(TRIM(babyName)) = LOWER(TRIM(?))',
      args: [newVoteCount, babyName],
    })
    
    return newVoteCount
  } catch (error) {
    console.error('Error updating vote count in Turso:', error)
    throw error
  }
}

// Get all suggestions for CSV export
export async function getAllSuggestions(): Promise<Suggestion[]> {
  return readSuggestions()
}

