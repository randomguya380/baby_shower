import { NextRequest, NextResponse } from 'next/server'
import { updateVoteCount } from '@/lib/tursoHandler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { babyName } = body

    if (!babyName) {
      return NextResponse.json(
        { error: 'Baby name is required' },
        { status: 400 }
      )
    }

    const newVoteCount = await updateVoteCount(babyName)

    if (newVoteCount === null) {
      return NextResponse.json(
        { error: 'Name not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { voteCount: newVoteCount },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
}

