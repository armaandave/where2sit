"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import * as motion from "motion/react-client"
import MotionGradientButton from "@/components/MotionGradientButton"

interface Theater {
  id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
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
  const [isCitySearch, setIsCitySearch] = useState(false)

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
    setLoading(true);
    setError(null);

    if (isCitySearch) {
      if (citySearchQuery.trim()) {
        router.push(`/theaters/${citySearchQuery.toLowerCase().replace(/\s+/g, "-")}`);
      } else {
        setError("Please enter a city name.");
      }
    } else { // Theater search
      if (theaterSearchQuery.trim()) {
        const encodedQuery = encodeURIComponent(theaterSearchQuery);
        router.push(`/theaters/search/${encodedQuery}`);
      } else {
        setError("Please enter a theater name.");
      }
    }
    setLoading(false);
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
    const sanitizedCity = theater.address?.city?.trim().toLowerCase().replace(/\s+/g, "-");
    if (sanitizedCity) {
      router.push(`/theaters/${sanitizedCity}/${theater.id}`);
    }
  }, [router]);

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  ).slice(0, 5) // Limit to 5 suggestions

  const filteredTheaters = allTheaters.filter(theater =>
    theater.name && theater.name.toLowerCase().includes(theaterSearchQuery.toLowerCase())
  ).slice(0, 5) // Limit to 5 theater suggestions

  const toggleSwitch = () => {
    setIsCitySearch(!isCitySearch);
    // Clear both search queries when toggling
    setCitySearchQuery("");
    setTheaterSearchQuery("");
    setShowSuggestions(false);
    setShowTheaterSuggestions(false);
    setError(null); // Clear any previous errors
  };

  const containerStyle = {
    width: 75,
    height: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 2.5,
    margin: "0",
  };

  const handleStyle = {
    width: 35,
    height: 15,
    backgroundColor: "#4f46e5",
    borderRadius: "7.5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Where2Sit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Find the Best Seat in Any Theater</p>
        </div>

        {/* Home Screen */}
        <Card className="max-w-lg mx-auto w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Toggle Switch */}
          <CardHeader className="pt-4 pb-2 flex flex-row items-center justify-center space-x-2">
            <span className={`text-lg font-bold ${isCitySearch ? 'text-gray-900' : 'text-gray-400'} transition-colors duration-200`}>City</span>
            <button
              className="relative rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{
                  ...containerStyle,
                  justifyContent: isCitySearch ? "flex-start" : "flex-end",
                  margin: "0",
              }}
              onClick={toggleSwitch}
            >
              <motion.div
                  style={handleStyle}
                  layout
                  transition={{
                      type: "spring",
                      visualDuration: 0.2,
                      bounce: 0.2,
                  }}
              />
            </button>
            <span className={`text-lg font-bold ${!isCitySearch ? 'text-gray-900' : 'text-gray-400'} transition-colors duration-200`}>Theater</span>
          </CardHeader>
          <CardContent className="space-y-6 px-8 py-4">
            {isCitySearch ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="city-search"
                    placeholder="Enter city..."
                    value={citySearchQuery}
                    onChange={(e) => {
                      setCitySearchQuery(e.target.value)
                      setShowSuggestions(true)
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
                          onMouseDown={() => handleSuggestionClick(city)}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="theater-search"
                    placeholder="Enter theater name..."
                    value={theaterSearchQuery}
                    onChange={(e) => {
                      setTheaterSearchQuery(e.target.value);
                      setShowTheaterSuggestions(true);
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
                          onMouseDown={() => handleTheaterSuggestionClick(theater)}
                        >
                          {theater.name} ({theater.address?.city})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <MotionGradientButton
              onClick={handleGo}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg"
            >
              {loading ? "Searching..." : "Go"}
            </MotionGradientButton>
            {error && <div className="text-center text-red-500 text-sm mt-2">Error: {error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
