import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Map, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1">
      <div className="relative w-full h-[50vh] min-h-[400px] bg-primary">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Create Interactive Tours with Ease
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Build engaging tour experiences with interactive maps, audio guides, and rich media content.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/create">
                    <a className="flex items-center">
                      <Map className="mr-2 h-5 w-5" />
                      Create New Tour
                    </a>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/tours">
                    <a className="flex items-center">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Explore Tours
                    </a>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Mark Points of Interest</h3>
            <p className="text-gray-600">
              Select locations on an interactive map to create points of interest for your tour.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Add Photos & Descriptions</h3>
            <p className="text-gray-600">
              Upload photos and write detailed descriptions for each point in your tour.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Create Audio Guides</h3>
            <p className="text-gray-600">
              Upload or record audio guides to enhance the experience of your tour.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/create">
              <a>Get Started Today</a>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
