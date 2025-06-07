import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Best Seat Finder</h1>
        </div>

        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Theaters Found</h2>
            <p className="text-gray-600">
              We couldn't find any theaters in this location. Please try searching for a different city.
            </p>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Link href="/">Back to Search</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 