"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface Theater {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  brand?: string;
  chain?: string;
  screens_count: number;
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [citySearchQuery, setCitySearchQuery] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [theaterSearchQuery, setTheaterSearchQuery] = useState("")
  const [allTheaters, setAllTheaters] = useState<Theater[]>([])
  const [showTheaterSuggestions, setShowTheaterSuggestions] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("https://bestseat.fly.dev/cities")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setCities(data)
      } catch (e: any) {
        console.error("Error fetching cities:", e)
        setError(`Failed to load cities: ${e.message}`)
      }
    }

    const fetchAllTheaters = async () => {
      try {
        const response = await fetch("https://bestseat.fly.dev/theaters")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAllTheaters(data)
      } catch (e: any) {
        console.error("Error fetching all theaters:", e)
        setError(`Failed to load all theaters: ${e.message}`)
      }
    }

    fetchCities()
    fetchAllTheaters()
  }, [])

  const handleGo = async () => {
    if (citySearchQuery) {
      router.push(`/theaters/${citySearchQuery.toLowerCase().replace(/\s+/g, "-")}`);
    } else if (theaterSearchQuery) {
      // Encode the theater search query for the URL, without replacing spaces with hyphens
      const encodedQuery = encodeURIComponent(theaterSearchQuery);
      router.push(`/theaters/search/${encodedQuery}`);
    }
  };

  const handleSuggestionClick = useCallback((city: string) => {
    setCitySearchQuery(city)
    setShowSuggestions(false)
    const sanitizedCity = city.trim().toLowerCase().replace(/\s+/g, "-")
    router.push(`/theaters/${sanitizedCity}`)
  }, [router])

  const handleTheaterSuggestionClick = useCallback((theater: Theater) => {
    setTheaterSearchQuery(theater.name);
    setShowTheaterSuggestions(false);
    const sanitizedCity = theater.address.city.trim().toLowerCase().replace(/\s+/g, "-");
    router.push(`/theaters/${sanitizedCity}/${theater.id}`);
  }, [router]);

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  ).slice(0, 5) // Limit to 5 suggestions

  const filteredTheaters = allTheaters.filter(theater =>
    theater.name.toLowerCase().includes(theaterSearchQuery.toLowerCase())
  ).slice(0, 5) // Limit to 5 theater suggestions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Where To Sit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Find the Best Seat in Any Theater</p>
        </div>

        {/* Home Screen */}
        <Card className="max-w-lg mx-auto w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-2">
              <Label htmlFor="city-search">Search for a city</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="city-search"
                  placeholder="Enter city..."
                  value={citySearchQuery}
                  onChange={(e) => {
                    setCitySearchQuery(e.target.value)
                    setShowSuggestions(true)
                    setTheaterSearchQuery("") // Clear theater search when typing in city search
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGo()
                    }
                  }}
                  className="pl-10 h-12 text-base"
                />
                {showSuggestions && citySearchQuery.length > 0 && filteredCities.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <li
                        key={city}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                        onMouseDown={() => handleSuggestionClick(city)} // Use onMouseDown to prevent onBlur from firing first
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="text-center text-gray-700 dark:text-gray-300 my-4">or</p>

            <div className="space-y-2">
              <Label htmlFor="theater-search">Search for a theater name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="theater-search"
                  placeholder="Enter theater name..."
                  value={theaterSearchQuery}
                  onChange={(e) => {
                    setTheaterSearchQuery(e.target.value);
                    setShowTheaterSuggestions(true);
                    setCitySearchQuery(""); // Clear city search when typing in theater search
                  }}
                  onFocus={() => setShowTheaterSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTheaterSuggestions(false), 100)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGo();
                    }
                  }}
                  className="pl-10 h-12 text-base"
                />
                {showTheaterSuggestions && theaterSearchQuery.length > 0 && filteredTheaters.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {filteredTheaters.map((theater) => (
                      <li
                        key={theater.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                        onMouseDown={() => handleTheaterSuggestionClick(theater)} // Pass the full theater object
                      >
                        {theater.name} ({theater.address?.city})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Button
              onClick={handleGo}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg"
              disabled={loading || (!citySearchQuery.trim() && !theaterSearchQuery.trim())}
            >
              {loading ? "Searching..." : "Go"}
            </Button>
            {error && <div className="text-center text-red-500 text-sm mt-2">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
