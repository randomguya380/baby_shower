import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { createObjectCsvWriter } from 'csv-writer'

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'suggestions.csv')

export interface Suggestion {
  userName: string
  babyName: string
  meaning: string
  voteCount: number
}

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize CSV file with headers if it doesn't exist
function initializeCSV() {
  ensureDataDirectory()
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const headers = 'userName,babyName,meaning,voteCount\n'
    fs.writeFileSync(CSV_FILE_PATH, headers, 'utf-8')
  }
}

// Read all suggestions from CSV
export function readSuggestions(): Suggestion[] {
  initializeCSV()
  
  try {
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8')
    
    if (!fileContent.trim()) {
      return []
    }
    
    const result = Papa.parse<Suggestion>(fileContent, {
      header: true,
      skipEmptyLines: true,
    })
    
    return result.data.map((row) => ({
      userName: row.userName || '',
      babyName: row.babyName || '',
      meaning: row.meaning || '',
      voteCount: parseInt(row.voteCount?.toString() || '0', 10),
    }))
  } catch (error) {
    console.error('Error reading CSV:', error)
    return []
  }
}

// Append a new suggestion to CSV
export function appendSuggestion(suggestion: Omit<Suggestion, 'voteCount'>): void {
  initializeCSV()
  
  const csvWriter = createObjectCsvWriter({
    path: CSV_FILE_PATH,
    header: [
      { id: 'userName', title: 'userName' },
      { id: 'babyName', title: 'babyName' },
      { id: 'meaning', title: 'meaning' },
      { id: 'voteCount', title: 'voteCount' },
    ],
    append: true,
  })
  
  csvWriter.writeRecords([{ ...suggestion, voteCount: 0 }])
}

// Check if a baby name already exists (case-insensitive)
export function nameExists(babyName: string): boolean {
  const suggestions = readSuggestions()
  return suggestions.some(
    (s) => s.babyName.toLowerCase().trim() === babyName.toLowerCase().trim()
  )
}

// Update vote count for a specific baby name
export function updateVoteCount(babyName: string): number | null {
  initializeCSV()
  
  const suggestions = readSuggestions()
  const index = suggestions.findIndex(
    (s) => s.babyName.toLowerCase().trim() === babyName.toLowerCase().trim()
  )
  
  if (index === -1) {
    return null
  }
  
  suggestions[index].voteCount += 1
  
  // Write all suggestions back to CSV
  const csvWriter = createObjectCsvWriter({
    path: CSV_FILE_PATH,
    header: [
      { id: 'userName', title: 'userName' },
      { id: 'babyName', title: 'babyName' },
      { id: 'meaning', title: 'meaning' },
      { id: 'voteCount', title: 'voteCount' },
    ],
  })
  
  csvWriter.writeRecords(suggestions)
  
  return suggestions[index].voteCount
}

// Get CSV file path for download
export function getCSVFilePath(): string {
  return CSV_FILE_PATH
}

