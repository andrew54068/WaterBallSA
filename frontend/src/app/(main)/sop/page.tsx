import { BookOpenIcon } from '@heroicons/react/24/outline'

export default function SOPPage() {
  return (
    <main className="min-h-screen bg-dark-900">

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-yellow/10 rounded-2xl mb-6">
            <BookOpenIcon className="w-10 h-10 text-accent-yellow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SOP 寶典
          </h1>
          <p className="text-xl text-gray-400">
            水球潘的標準作業程序與最佳實踐
          </p>
        </div>

        {/* Content Placeholder */}
        <div className="bg-dark-800 rounded-2xl p-12 border border-dark-600 text-center">
          <div className="mb-6">
            <span className="text-6xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            內容即將推出
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            SOP 寶典將包含軟體開發的標準作業流程、最佳實踐指南、以及團隊協作規範。
            敬請期待！
          </p>
        </div>

        {/* Future Sections Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-lg font-bold text-white mb-2">開發流程</h3>
            <p className="text-sm text-gray-400">
              從需求分析到部署的完整開發流程 SOP
            </p>
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white mb-2">最佳實踐</h3>
            <p className="text-sm text-gray-400">
              程式碼品質、測試策略、重構技巧
            </p>
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-white mb-2">團隊協作</h3>
            <p className="text-sm text-gray-400">
              Code Review、Git 工作流、溝通技巧
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
