"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowLeft } from "lucide-react"

interface Theater {
  id: number | string
  name: string
  brand?: string
  chain?: string
  address?: string | { street?: string; city?: string; state?: string; postcode?: string; country?: string }
  street?: string
  city?: string
  state?: string
  country?: string
  postcode?: string
  screens_count?: number
}

export default function TheaterSearchResults({ params }: { params: { query: string } }) {
  const router = useRouter()
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Decode the query for display and filtering
  const decodedQuery = decodeURIComponent(params.query).replace(/-/g, " ");

  useEffect(() => {
    const fetchTheaters = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("https://bestseat.fly.dev/theaters")
        if (!response.ok) {
          throw new Error("Failed to fetch theaters")
        }
        const allTheaters = await response.json()
        
        // Filter theaters by name (case insensitive) using the decoded query
        const searchQuery = decodedQuery.toLowerCase()
        const matchingTheaters = allTheaters.filter((theater: Theater) => 
          theater.name.toLowerCase().includes(searchQuery)
        )

        setTheaters(matchingTheaters)
      } catch (err) {
        setError("Failed to fetch theaters")
      } finally {
        setLoading(false)
      }
    }

    fetchTheaters()
  }, [decodedQuery]) // Depend on decodedQuery

  const handleTheaterClick = (theater: Theater) => {
    if (theater.city) {
      const citySlug = theater.city.toLowerCase().replace(/\s+/g, "-")
      router.push(`/theaters/${citySlug}/${theater.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 px-4 py-2 text-base font-medium hover:bg-white/60 rounded-lg shadow-none"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Theaters matching "{decodedQuery}"
          </h1>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500">Loading theaters...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : theaters.length === 0 ? (
            <div className="text-center text-gray-500">No theaters found matching "{decodedQuery}"</div>
          ) : (
            <div className="space-y-4">
              {theaters.map((theater) => (
                <Card
                  key={theater.id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-2xl"
                  onClick={() => handleTheaterClick(theater)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {theater.name}
                        </h2>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>
                            {theater.street && `${theater.street}, `}
                            {theater.city}
                            {theater.state && `, ${theater.state}`}
                            {theater.postcode && ` ${theater.postcode}`}
                          </span>
                        </div>
                        {(theater.brand || theater.chain) && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                            {theater.brand || theater.chain}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600">
                          {theater.screens_count} {theater.screens_count === 1 ? 'screen' : 'screens'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 