'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, RefreshCw } from 'lucide-react'

interface Suggestion {
  userName: string
  babyName: string
  meaning: string
  voteCount: number
}

export default function NameList() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [votingNames, setVotingNames] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSuggestions()

    // Refresh when window regains focus
    const handleFocus = () => {
      fetchSuggestions()
    }
    window.addEventListener('focus', handleFocus)

    // Listen for custom refresh event
    const handleRefresh = () => {
      fetchSuggestions()
    }
    window.addEventListener('suggestionAdded', handleRefresh)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('suggestionAdded', handleRefresh)
    }
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions')
      const data = await response.json()
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (babyName: string) => {
    if (votingNames.has(babyName)) return

    setVotingNames((prev) => new Set(prev).add(babyName))

    try {
      const response = await fetch('/api/suggestions/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ babyName }),
      })

      const data = await response.json()

      if (response.ok && data.voteCount !== undefined) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.babyName === babyName
              ? { ...s, voteCount: data.voteCount }
              : s
          )
        )
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingNames((prev) => {
        const newSet = new Set(prev)
        newSet.delete(babyName)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading suggestions...</p>
        </div>
      </section>
    )
  }

  if (suggestions.length === 0) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-gray-800">
              Name Suggestions
            </h2>
            <p className="text-gray-600">No suggestions yet. Be the first to suggest a name!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 md:px-8 bg-cream-light">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center mb-12 relative">
          <h2 className="text-4xl md:text-5xl font-serif text-center text-gray-800">
            Name Suggestions
          </h2>
          <button
            onClick={fetchSuggestions}
            className="absolute right-0 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all"
            aria-label="Refresh suggestions"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={`${suggestion.babyName}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl md:text-3xl font-serif text-gray-800">
                      {suggestion.babyName}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Meaning:</span> {suggestion.meaning}
                  </p>
                  <p className="text-sm text-gray-500">
                    Suggested by {suggestion.userName}
                  </p>
                </div>

                <button
                  onClick={() => handleVote(suggestion.babyName)}
                  disabled={votingNames.has(suggestion.babyName)}
                  className="flex items-center gap-2 px-6 py-3 bg-pink-100 hover:bg-pink-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      suggestion.voteCount > 0
                        ? 'text-pink-600 fill-pink-600'
                        : 'text-pink-400 group-hover:text-pink-600'
                    } transition-colors`}
                  />
                  <span className="font-medium text-pink-700">
                    {suggestion.voteCount}
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

