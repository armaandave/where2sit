"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowLeft } from "lucide-react"
import Loading from "./loading"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import React from "react"
import CharactersRemaining from "@/components/CharactersRemaining"

// API types
interface BestSeatSuggestion {
  id: number;
  suggested_seat: string;
  user_notes: string | null;
  timestamp: string; // Assuming ISO string from backend
}

interface Screen {
  id: number | string
  name: string
  screen_number?: number
  type?: string
  suggestions?: BestSeatSuggestion[]; // Use this for best seat recommendation
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

export default function ScreenDetails({ params }: { params: { city: string; id: string; screenId: string } }) {
  const router = useRouter()
  const [theater, setTheater] = useState<Theater | null>(null)
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestedSeat, setSuggestedSeat] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bestSeat, setBestSeat] = useState<BestSeatSuggestion | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Forbidden words list for client-side validation
  const forbiddenWords = [
    "fuck", "shit", "bitch", "asshole", "dick", "pussy", "bastard", "slut",
    "cunt", "faggot", "nigger", "retard", "whore", "rape", "nazi", "hitler",
    "chink", "spic", "kike", "coon", "dyke", "tranny", "moron", "fag", "crap",
    "dumbass", "jackass", "twat", "cock", "balls", "suckmydick", "kill yourself",
    "gas the jews", "heil hitler"
  ];

  useEffect(() => {
    const fetchTheater = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`https://bestseat.fly.dev/theaters/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch theater details")
        }
        const data = await res.json()
        setTheater(data)
        
        // Find the selected screen
        const screen = data.screens?.find((s: Screen) => s.id.toString() === params.screenId)
        if (screen) {
          setSelectedScreen(screen)
        } else {
          throw new Error("Screen not found")
        }

        // Fetch best seat suggestion
        const bestSeatRes = await fetch(`https://bestseat.fly.dev/screens/${params.screenId}/best_seat`)
        if (bestSeatRes.ok) {
          const bestSeatData = await bestSeatRes.json()
          setBestSeat(bestSeatData)
        }
        // Don't treat 404 as an error - it just means no suggestions yet
      } catch (err) {
        setError("Failed to fetch theater details")
      } finally {
        setLoading(false)
      }
    }

    fetchTheater()
  }, [params.id, params.screenId])

  // Add validation function
  const validateSeatNumber = (seat: string): boolean => {
    // Allow format like "F10" or "A1" - letter followed by number
    const seatPattern = /^[A-Za-z][0-9]+$/;
    return seatPattern.test(seat);
  };

  // Add validation function for notes
  const validateUserNotes = (notes: string): boolean => {
    if (!notes) return true; // Allow empty notes
    const lowerCaseNotes = notes.toLowerCase();
    return !forbiddenWords.some(word => lowerCaseNotes.includes(word));
  };

  // Update the onChange handler for suggestedSeat
  const handleSeatChange = (value: string) => {
    const upperValue = value.toUpperCase(); // Convert to uppercase
    setSuggestedSeat(upperValue);
    
    if (!upperValue) {
      setSeatError(null);
    } else if (!validateSeatNumber(upperValue)) {
      setSeatError("Please enter a valid seat number (e.g., F10)");
    } else {
      setSeatError(null);
    }
  };

  // New onChange handler for user notes
  const handleNotesChange = (value: string) => {
    setUserNotes(value);
    if (!validateUserNotes(value)) {
      setNotesError("Your notes contain forbidden language. Please revise.");
    } else {
      setNotesError(null);
    }
  };

  // Update the form submission handler
  const handleSubmitSuggestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);
    setError(null);
    setNotesError(null);

    if (!suggestedSeat.trim()) {
      setError("Please enter a suggested seat.");
      setIsSubmitting(false);
      return;
    }

    if (!validateSeatNumber(suggestedSeat)) {
      setError("Please enter a valid seat number (e.g., F10)");
      setIsSubmitting(false);
      return;
    }

    // Client-side validation for notes before submission
    if (userNotes && !validateUserNotes(userNotes)) {
      setNotesError("Your notes contain forbidden language. Please revise.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`https://bestseat.fly.dev/screens/${params.screenId}/suggest_best_seat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggested_seat: suggestedSeat,
          user_notes: userNotes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit suggestion.");
      }

      const data = await response.json();
      setSubmissionMessage(data.message);
      setSuggestedSeat("");
      setUserNotes("");
      setSeatError(null);
      setNotesError(null);
      // After successful submission, re-fetch screen data to update displayed best seat
      const updatedRes = await fetch(`https://bestseat.fly.dev/theaters/${params.id}`);
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        const updatedScreen = updatedData.screens?.find((s: Screen) => s.id.toString() === params.screenId);
        if (updatedScreen) {
          setSelectedScreen(updatedScreen);
        }
      }
      setShowSuggestionForm(false);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Screen Details */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500">Loading screen details...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : theater && selectedScreen ? (
            <div className="space-y-8">
              {/* Screen Info */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {theater.name} - {selectedScreen.name || `Screen ${selectedScreen.screen_number}`}
                </h2>
                <p className="text-gray-600 mb-2">{selectedScreen.type || ""}</p>
              </div>

              {/* Best Seat Display */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="py-8 text-center">
                    <div className="space-y-6">
                      {bestSeat ? (
                        <div className="inline-flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-4">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center text-white text-lg">★</div>
                          <span className="text-green-800 font-bold text-xl">Best Seat - {bestSeat.suggested_seat}</span>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-lg font-medium">No best seat recommendation yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggest Best Seat Button */}
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-lg transition duration-300"
                >
                  {showSuggestionForm ? "Hide Suggestion Form" : "Suggest a Best Seat"}
                </Button>
              </div>

              {/* Best Seat Suggestion Form */}
              {showSuggestionForm && (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mt-4">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="suggested-seat">Suggested Seat</Label>
                        <CharactersRemaining
                          value={suggestedSeat}
                          maxLength={4}
                          onChange={handleSeatChange}
                          placeholder="e.g., F10"
                          className={seatError ? "border-red-500" : ""}
                          required={true}
                          pattern="[A-Za-z][0-9]+"
                        />
                        {seatError && <p className="text-sm text-red-500 mt-1">{seatError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-notes">Notes (Optional)</Label>
                        <CharactersRemaining
                          as="textarea"
                          value={userNotes}
                          maxLength={100}
                          onChange={handleNotesChange}
                          placeholder="e.g., Great center view, low head obstruction"
                          rows={3}
                          className={notesError ? "border-red-500" : ""}
                        />
                        <p className="text-sm text-gray-500 mt-1">Please keep your notes respectful and avoid offensive language.</p>
                        {notesError && <p className="text-sm text-red-500 mt-1">{notesError}</p>}
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        disabled={isSubmitting || !!seatError || !!notesError}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                      </Button>
                      {submissionMessage && <p className="text-center text-green-600 mt-2">{submissionMessage}</p>}
                      {error && <p className="text-center text-red-500 mt-2">{error}</p>}
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">Screen not found</div>
          )}
        </div>
      </div>
    </div>
  )
} 