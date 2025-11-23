import React from 'react'

interface MockReactPlayerProps {
  url: string
  controls?: boolean
  playing?: boolean
  width?: string
  height?: string
  onReady?: () => void
  onError?: () => void
  onPlay?: () => void
  onPause?: () => void
  config?: any
  style?: React.CSSProperties
}

const MockReactPlayer = ({
  url,
  onReady,
  onError,
  onPlay,
  onPause,
}: MockReactPlayerProps) => {
  return (
    <div data-testid="mock-react-player" data-url={url}>
      <button onClick={onReady} data-testid="trigger-ready">
        Ready
      </button>
      <button onClick={onError} data-testid="trigger-error">
        Error
      </button>
      <button onClick={onPlay} data-testid="trigger-play">
        Play
      </button>
      <button onClick={onPause} data-testid="trigger-pause">
        Pause
      </button>
    </div>
  )
}

// Default export
export default MockReactPlayer

// Named exports for different player types
export { MockReactPlayer as ReactPlayer }
