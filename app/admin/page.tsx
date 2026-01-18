'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, LogOut } from 'lucide-react'

interface Suggestion {
  userName: string
  babyName: string
  meaning: string
  voteCount: number
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/login')
      const data = await response.json()
      setIsAuthenticated(data.authenticated === true)
      if (data.authenticated) {
        fetchSuggestions()
      }
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const fetchSuggestions = async () => {
    setLoading(true)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        fetchSuggestions()
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setUsername('')
      setPassword('')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch('/api/suggestions')
      const data = await response.json()

      if (!data.suggestions) {
        alert('No data to download')
        return
      }

      // Convert to CSV format
      const headers = ['userName', 'babyName', 'meaning', 'voteCount']
      const csvContent = [
        headers.join(','),
        ...data.suggestions.map((s: Suggestion) =>
          [
            `"${s.userName}"`,
            `"${s.babyName}"`,
            `"${s.meaning}"`,
            s.voteCount,
          ].join(',')
        ),
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'suggestions.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV')
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-light">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-light px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 w-full max-w-md">
          <h1 className="text-4xl font-serif text-center mb-8 text-gray-800">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2 text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-xl font-medium text-lg shadow-lg transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-light py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-gray-800">
              Name Suggestions
            </h2>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading...</p>
          ) : suggestions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No suggestions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-serif text-gray-800">
                      User Name
                    </th>
                    <th className="text-left py-4 px-4 font-serif text-gray-800">
                      Baby Name
                    </th>
                    <th className="text-left py-4 px-4 font-serif text-gray-800">
                      Meaning
                    </th>
                    <th className="text-left py-4 px-4 font-serif text-gray-800">
                      Vote Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((suggestion, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-cream-light transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-700">
                        {suggestion.userName}
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-medium">
                        {suggestion.babyName}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {suggestion.meaning || <span className="text-gray-400 italic">No meaning provided</span>}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {suggestion.voteCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

