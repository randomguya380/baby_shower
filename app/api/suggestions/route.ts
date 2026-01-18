import { NextRequest, NextResponse } from 'next/server'
import {
  readSuggestions,
  appendSuggestion,
  nameExists,
} from '@/lib/tursoHandler'

export async function GET() {
  try {
    const suggestions = await readSuggestions()
    return NextResponse.json({ suggestions }, { status: 200 })
  } catch (error) {
    console.error('Error reading suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to read suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, babyName, meaning } = body

    // Validation
    if (!userName || !babyName) {
      return NextResponse.json(
        { error: 'User name and baby name are required' },
        { status: 400 }
      )
    }

    // Check for duplicate (case-insensitive)
    if (await nameExists(babyName)) {
      return NextResponse.json(
        { error: 'This name has already been suggested' },
        { status: 409 }
      )
    }

    // Append to Turso (meaning is optional)
    await appendSuggestion({
      userName: userName.trim(),
      babyName: babyName.trim(),
      meaning: meaning ? meaning.trim() : '',
    })

    return NextResponse.json(
      { message: 'Suggestion added successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to add suggestion' },
      { status: 500 }
    )
  }
}

