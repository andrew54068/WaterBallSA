'use client'

import React from 'react'

interface ArticleMetadata {
  wordCount?: number
  readingLevel?: string
  codeExamples?: number
  estimatedReadTime?: number
}

interface ArticleRendererProps {
  articleUrl: string
  title: string
  description?: string
  metadata?: ArticleMetadata
  duration?: number
}

export default function ArticleRenderer({
  articleUrl,
  title,
  description,
  metadata,
  duration,
}: ArticleRendererProps) {
  const handleReadArticle = () => {
    window.open(articleUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">Article Lesson</h3>
        <p className="text-blue-100 text-center text-sm">
          Read external article content
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Description */}
        {description && (
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {/* Metadata Grid */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {metadata.wordCount && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Word Count
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metadata.wordCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metadata.readingLevel && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reading Level
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {metadata.readingLevel}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metadata.codeExamples !== undefined && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Code Examples
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {metadata.codeExamples}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {duration && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Estimated Time
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {duration} min
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleReadArticle}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Read Article
          </button>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Opens in a new tab
          </p>
        </div>
      </div>
    </div>
  )
}
