"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowLeft } from "lucide-react"
import Loading from "./loading"

// API types
interface Screen {
  id: number | string
  name: string
  screen_number?: number
  type?: string
}

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
  screens?: Screen[]
}

// Helper to format address
function formatAddress(theater: Theater | null) {
  if (!theater) return "";
  if (typeof theater.address === "object" && theater.address !== null) {
    return [
      theater.address.street,
      theater.address.city,
      theater.address.state,
      theater.address.postcode,
      theater.address.country,
    ].filter(Boolean).join(", ");
  }
  return theater.address || theater.street || "";
}

export default function TheaterDetails({ params }: { params: { city: string; id: string } }) {
  const router = useRouter()
  const [theater, setTheater] = useState<Theater | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTheater = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:8000/theaters/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch theater details")
        }
        const data = await res.json()
        setTheater(data)
      } catch (err) {
        setError("Failed to fetch theater details")
      } finally {
        setLoading(false)
      }
    }

    fetchTheater()
  }, [params.id])

  const handleViewSeatMap = (screen: Screen) => {
    router.push(`/theaters/${params.city}/${params.id}/screens/${screen.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 px-4 py-2 text-base font-medium hover:bg-white/60 rounded-lg shadow-none"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {/* Theater Details */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500">Loading theater details...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : theater ? (
            <div className="space-y-8">
              {/* Theater Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-3xl font-bold text-gray-900">{theater.name}</h2>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {theater.brand || theater.chain || "Unknown"}
                        </span>
                      </div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {formatAddress(theater)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screens Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(theater.screens || []).map((screen) => (
                  <Card
                    key={screen.id}
                    className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {screen.name || `Screen ${screen.screen_number}`}
                          </h3>
                          <p className="text-sm text-gray-600">{screen.type || ""}</p>
                        </div>

                        <Button
                          onClick={() => handleViewSeatMap(screen)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          View Seat Map
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Theater not found</div>
          )}
        </div>
      </div>
    </div>
  )
} 