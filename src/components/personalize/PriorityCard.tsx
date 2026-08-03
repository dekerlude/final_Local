'use client'

import { Check } from 'lucide-react'
import clsx from 'clsx'

interface PriorityCardProps {
  factor: string;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  draggableId?: string;
  onDragStart?: (_e: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: (_e: React.DragEvent<HTMLButtonElement>) => void;
  rank?: number;
}

export default function PriorityCard({
  factor,
  isSelected,
  onSelect,
  draggableId,
  onDragStart,
  onDragEnd,
}: PriorityCardProps) {
  return (
    <button
      draggable={isSelected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      data-draggable-id={draggableId}

      className={clsx(
        'w-full p-4 rounded-lg border transition-all relative group text-left cursor-pointer',
        isSelected
          ? 'border-text-primary bg-bg-secondary'
          : 'border-border-light bg-bg-primary hover:border-border-dark'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all',
            isSelected
              ? 'border-text-primary bg-text-primary'
              : 'border-border-dark bg-transparent group-hover:border-text-tertiary'
          )}
        >
          {isSelected && <Check className="w-3.5 h-3.5 text-bg-primary" />}
        </div>
        <span className="font-medium text-text-primary">{factor}</span>
      </div>
    </button>
  )
}
