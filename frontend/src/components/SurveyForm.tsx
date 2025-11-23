'use client'

import React from 'react'

interface SurveyMetadata {
  questionCount?: number
  passingScore?: number
  difficulty?: string
  timeLimit?: number
}

interface SurveyFormProps {
  surveyPath: string
  title: string
  description?: string
  metadata?: SurveyMetadata
  duration?: number
}

export default function SurveyForm({
  surveyPath,
  title,
  description,
  metadata,
  duration,
}: SurveyFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-8 text-white">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">Knowledge Check</h3>
        <p className="text-purple-100 text-center text-sm">
          Test your understanding
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {metadata.questionCount && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Questions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.questionCount}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metadata.passingScore !== undefined && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Passing Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.passingScore}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metadata.difficulty && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Difficulty
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {metadata.difficulty}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {duration && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3"
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
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Estimated Time
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {duration} min
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Survey/Quiz Functionality Coming Soon
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Interactive quizzes and surveys will be available in Phase 3
            </p>
            <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
              Phase 3 Feature
            </div>
          </div>
        </div>

        {/* Survey Path Info (for debugging/development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
            <strong>Survey Path:</strong> {surveyPath}
          </div>
        )}
      </div>
    </div>
  )
}
