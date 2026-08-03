'use client'

import RankingBadge from './RankingBadge'

interface RankingListProps {
  items: string[]
}

export default function RankingList({ items }: RankingListProps) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-center gap-3 p-3 bg-bg-secondary border border-border-light rounded-lg transition-colors hover:border-border-dark"
        >
          <RankingBadge rank={index + 1} />
          <span className="font-medium text-text-primary">{item}</span>
        </div>
      ))}
    </div>
  )
}
