import { kv } from '@vercel/kv'

export interface Suggestion {
  userName: string
  babyName: string
  meaning: string
  voteCount: number
}

const SUGGESTIONS_KEY = 'suggestions'

// Read all suggestions from KV
export async function readSuggestions(): Promise<Suggestion[]> {
  try {
    const suggestions = await kv.get<Suggestion[]>(SUGGESTIONS_KEY)
    return suggestions || []
  } catch (error) {
    console.error('Error reading suggestions from KV:', error)
    return []
  }
}

// Append a new suggestion to KV
export async function appendSuggestion(
  suggestion: Omit<Suggestion, 'voteCount'>
): Promise<void> {
  try {
    const suggestions = await readSuggestions()
    const newSuggestion: Suggestion = {
      ...suggestion,
      voteCount: 0,
    }
    suggestions.push(newSuggestion)
    await kv.set(SUGGESTIONS_KEY, suggestions)
  } catch (error) {
    console.error('Error appending suggestion to KV:', error)
    throw error
  }
}

// Check if a baby name already exists (case-insensitive)
export async function nameExists(babyName: string): Promise<boolean> {
  const suggestions = await readSuggestions()
  return suggestions.some(
    (s) => s.babyName.toLowerCase().trim() === babyName.toLowerCase().trim()
  )
}

// Update vote count for a specific baby name
export async function updateVoteCount(
  babyName: string
): Promise<number | null> {
  try {
    const suggestions = await readSuggestions()
    const index = suggestions.findIndex(
      (s) => s.babyName.toLowerCase().trim() === babyName.toLowerCase().trim()
    )

    if (index === -1) {
      return null
    }

    suggestions[index].voteCount += 1
    await kv.set(SUGGESTIONS_KEY, suggestions)

    return suggestions[index].voteCount
  } catch (error) {
    console.error('Error updating vote count in KV:', error)
    throw error
  }
}

// Get all suggestions for CSV export
export async function getAllSuggestions(): Promise<Suggestion[]> {
  return readSuggestions()
}

