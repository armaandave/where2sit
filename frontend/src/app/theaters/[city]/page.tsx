"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
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

export default function TheatersByCity({ params }: { params: { city: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chainFilter = searchParams.get("chain") || "all"
  
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theaterLoading, setTheaterLoading] = useState(false)
  const { city: initialCity } = params
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [availableChains, setAvailableChains] = useState<string[]>([]);

  // Fetch theaters for the city
  useEffect(() => {
    const fetchTheaters = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://bestseat.fly.dev/theaters/by_city/${params.city}`)
        if (!res.ok) {
          throw new Error("Failed to fetch theaters")
        }
        const data = await res.json()
        // Only show theaters with screens_count > 0
        const filtered = data.filter((t: Theater) => t.screens_count && t.screens_count > 0)
        setTheaters(filtered)

        // Extract unique chains/brands and sort them
        const chains: string[] = Array.from(new Set(filtered.map((t: Theater) => {
          const primaryIdentifier = t.brand || t.chain;
          if (!primaryIdentifier || String(primaryIdentifier).toLowerCase() === "null" || String(primaryIdentifier).toLowerCase() === "undefined") {
            return "Unknown";
          }
          return primaryIdentifier;
        })));
        setAvailableChains(chains.sort());

      } catch (err) {
        setError("Failed to fetch theaters")
      } finally {
        setLoading(false)
      }
    }

    fetchTheaters()
  }, [params.city])

  const handleChainFilterChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value === "all") {
      url.searchParams.delete("chain")
    } else {
      url.searchParams.set("chain", value)
    }
    router.push(url.pathname + url.search)
  }

  const handleSelectTheater = async (theater: Theater) => {
    setTheaterLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://bestseat.fly.dev/theaters/${theater.id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch theater details")
      }
      const data = await res.json()
      router.push(`/theaters/${params.city}/${theater.id}`)
    } catch (err) {
      setError("Failed to fetch theater details")
    } finally {
      setTheaterLoading(false)
    }
  }

  // Filter theaters by chain
  const filteredTheaters = theaters.filter((theater) => {
    if (chainFilter === "all") {
      return true;
    }
    if (chainFilter === "unknown") {
      const primaryIdentifier = theater.brand || theater.chain;
      return !primaryIdentifier || String(primaryIdentifier).toLowerCase() === "null" || String(primaryIdentifier).toLowerCase() === "undefined";
    }
    const primaryIdentifier = (theater.brand || theater.chain || "").toLowerCase();
    return primaryIdentifier === chainFilter;
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  if (theaters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex flex-col items-center justify-center relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 px-4 py-2 text-base font-medium hover:bg-white/60 rounded-lg shadow-none"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold mb-4">No Theaters Found</h1>
        <p className="text-gray-600 dark:text-gray-400">Sorry, no theaters were found for {decodeURIComponent(initialCity)}.</p>
      </div>
    );
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
            Theaters in {params.city.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
          </h1>
        </div>

        {/* Theaters List */}
        <div className="max-w-4xl mx-auto pb-8">
          <div className="mb-8 text-center">
          </div>

          {/* Chain Filter */}
          <div className="mb-8 flex justify-center">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full max-w-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="chain-filter" className="text-sm font-medium whitespace-nowrap">
                    Filter by Chain:
                  </Label>
                  <Select value={chainFilter} onValueChange={handleChainFilterChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chains</SelectItem>
                      {availableChains.map((chain) => (
                        <SelectItem key={chain} value={chain.toLowerCase()}>{chain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theater Cards */}
          <div className="flex flex-col gap-8">
            {filteredTheaters.map((theater) => (
              <Card
                key={theater.id}
                className="cursor-pointer hover:scale-[1.03] transition-transform duration-200 hover:shadow-2xl"
                onClick={() => handleSelectTheater(theater)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{theater.name}</h3>
                    {(theater.brand || theater.chain) && (
                      <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                        {theater.brand || theater.chain}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline-block mr-1" />
                    {formatAddress(theater)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Screens: {theater.screens_count} {theater.screens_count === 1 ? "Screen" : "Screens"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 