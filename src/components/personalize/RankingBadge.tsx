'use client'

import clsx from 'clsx'

interface RankingBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
}

export default function RankingBadge({ rank, size = 'md' }: RankingBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  return (
    <div
      className={clsx(
        sizeClasses[size],
        'flex items-center justify-center bg-bg-secondary text-text-primary border border-border-light rounded-full font-semibold'
      )}
    >
      {rank}
    </div>
  )
}
