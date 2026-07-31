import { BRAND } from '../brand'

export function Wordmark({ idle }: { idle: boolean }) {
  return (
    <span className={`wordmark ${idle ? 'wordmark--idle' : ''}`}>
      {BRAND.name}
      <span className="wordmark-cursor">{BRAND.cursor}</span>
    </span>
  )
}
