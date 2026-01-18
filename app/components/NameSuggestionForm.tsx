'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

type Gender = 'girl' | 'boy' | null

export default function NameSuggestionForm() {
  const [gender, setGender] = useState<Gender>(null)
  const [userName, setUserName] = useState('')
  const [babyName, setBabyName] = useState('')
  const [meaning, setMeaning] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!gender) {
      setError('Please select a gender')
      return
    }

    if (!userName.trim() || !babyName.trim()) {
      setError('Your name and baby name are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim(),
          babyName: babyName.trim(),
          meaning: meaning.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit suggestion')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      setUserName('')
      setBabyName('')
      setMeaning('')
      setIsSubmitting(false)

      // Trigger refresh event for NameList
      window.dispatchEvent(new Event('suggestionAdded'))

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const getThemeColors = () => {
    if (gender === 'girl') {
      return {
        bg: 'bg-blush-light',
        accent: 'bg-blush',
        text: 'text-pink-800',
        border: 'border-pink-300',
        button: 'bg-pink-500 hover:bg-pink-600',
      }
    } else if (gender === 'boy') {
      return {
        bg: 'bg-powder-light',
        accent: 'bg-powder',
        text: 'text-blue-800',
        border: 'border-blue-300',
        button: 'bg-blue-500 hover:bg-blue-600',
      }
    }
    return {
      bg: 'bg-cream-light',
      accent: 'bg-cream',
      text: 'text-gray-800',
      border: 'border-gray-300',
      button: 'bg-gray-500 hover:bg-gray-600',
    }
  }

  const colors = getThemeColors()

  return (
    <motion.section
      className={`py-16 px-4 md:px-8 transition-colors duration-300 ${colors.bg}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className={`bg-white rounded-2xl shadow-xl p-8 md:p-12 ${colors.bg}`}>
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-8 text-gray-800">
            Suggest a Name
          </h2>

          {/* Gender Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setGender('girl')}
              className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 ${
                gender === 'girl'
                  ? 'bg-blush text-pink-800 shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-blush-light'
              }`}
            >
              Girl
            </button>
            <button
              onClick={() => setGender('boy')}
              className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 ${
                gender === 'boy'
                  ? 'bg-powder text-blue-800 shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-powder-light'
              }`}
            >
              Boy
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className={`block text-sm font-medium mb-2 ${colors.text}`}
              >
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${colors.border} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  gender === 'girl'
                    ? 'focus:ring-pink-400'
                    : gender === 'boy'
                    ? 'focus:ring-blue-400'
                    : 'focus:ring-gray-400'
                } transition-all`}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="babyName"
                className={`block text-sm font-medium mb-2 ${colors.text}`}
              >
                Baby Name Suggestion
              </label>
              <input
                type="text"
                id="babyName"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${colors.border} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  gender === 'girl'
                    ? 'focus:ring-pink-400'
                    : gender === 'boy'
                    ? 'focus:ring-blue-400'
                    : 'focus:ring-gray-400'
                } transition-all`}
                placeholder="Enter baby name"
              />
            </div>

            <div>
              <label
                htmlFor="meaning"
                className={`block text-sm font-medium mb-2 ${colors.text}`}
              >
                Meaning of Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                id="meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 ${colors.border} focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  gender === 'girl'
                    ? 'focus:ring-pink-400'
                    : gender === 'boy'
                    ? 'focus:ring-blue-400'
                    : 'focus:ring-gray-400'
                } transition-all resize-none`}
                placeholder="What does this name mean?"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl"
              >
                Suggestion submitted successfully!
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${colors.button} text-white py-4 rounded-xl font-medium text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Submit Suggestion
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  )
}

