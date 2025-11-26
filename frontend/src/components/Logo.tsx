import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
      <div className="w-8 h-8 bg-gradient-to-br from-accent-yellow to-accent-yellow-dark rounded-lg flex items-center justify-center">
        <span className="text-dark-900 font-bold text-lg">水</span>
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-sm leading-tight">水球軟體學院</span>
        <span className="text-xs text-accent-yellow font-medium">WATERBALLSA.TW</span>
      </div>
    </Link>
  )
}
