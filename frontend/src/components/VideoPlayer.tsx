'use client'

import React, { useState } from 'react'
import ReactPlayer from 'react-player/youtube'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  duration?: number
}

export default function VideoPlayer({ videoUrl, title, duration }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const handleReady = () => {
    setIsReady(true)
    setError(null)
  }

  const handleError = () => {
    setError('Video unavailable. Please try again later.')
    setIsReady(false)
  }

  const handleRetry = () => {
    setError(null)
    setIsReady(false)
    // Force re-render by toggling a key
    window.location.reload()
  }

  if (error) {
    return (
      <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-white text-lg font-semibold mb-2">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Aspect ratio container (16:9) */}
      <div className="relative w-full pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden">
        {/* Loading skeleton */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-pulse flex flex-col items-center">
              <svg
                className="w-16 h-16 text-gray-600 mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
              </svg>
              <p className="text-gray-400 text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* React Player */}
        <ReactPlayer
          url={videoUrl}
          controls
          width="100%"
          height="100%"
          playing={playing}
          onReady={handleReady}
          onError={handleError}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              },
            },
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Video metadata */}
      {duration && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Duration: {duration} minutes
        </div>
      )}
    </div>
  )
}
