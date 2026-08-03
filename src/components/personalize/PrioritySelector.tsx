'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui/button'
import { X, GripVertical } from 'lucide-react'

const AVAILABLE_FACTORS = [
  'Safety & Crime',
  'Environment & Air Quality',
  'Public Transport',
  'Basic Amenities',
  'Schools',
  'Healthcare',
  'Affordability',
  'Nightlife',
  'Parks & Recreation',
  'Traffic & Commute',
  'Walkability',
  'Restaurants',
  'Shopping',
  'Family Friendly',
]

interface PrioritySelectorProps {
  onPrioritiesSelected: (_priorities: string[]) => void
  isLoading?: boolean
}

export default function PrioritySelector({
  onPrioritiesSelected,
  isLoading = false,
}: PrioritySelectorProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleSelectPriority = (factor: string) => {
    if (selectedPriorities.includes(factor)) {
      setSelectedPriorities(selectedPriorities.filter((f) => f !== factor))
    } else if (selectedPriorities.length < 10) {
      setSelectedPriorities([...selectedPriorities, factor])
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, factor: string) => {
    setDraggedItem(factor)
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const draggedIndex = selectedPriorities.indexOf(draggedItem)
    if (draggedIndex === index) return

    const newPriorities = [...selectedPriorities]
    newPriorities.splice(draggedIndex, 1)
    newPriorities.splice(index, 0, draggedItem)
    setSelectedPriorities(newPriorities)
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleGenerate = () => {
    if (selectedPriorities.length > 0 && selectedPriorities.length <= 10) {
      onPrioritiesSelected(selectedPriorities)
    }
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Column: Available Factors */}
        <div>
          <div className="mb-6">
            <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e] mb-1">
              Select Priorities
            </h2>
            <p className="text-sm text-[#01472e]/60">
              Choose up to 10 factors that matter most to you
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_FACTORS.map((factor) => {
              const isSelected = selectedPriorities.includes(factor);
              return (
                <button
                  key={factor}
                  onClick={() => handleSelectPriority(factor)}
                  className={clsx(
                    "px-5 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all duration-400 ease-premium border",
                    isSelected 
                      ? "bg-[#01472e] text-[#fefae0] border-[#01472e] shadow-md hover:-translate-y-[2px]" 
                      : "bg-[#e9edc9] text-[#01472e] border-[#01472e]/20 hover:border-[#01472e]/50 hover:bg-[#ccd5ae] shadow-xs"
                  )}
                >
                  {factor}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Ranked Priorities */}
        <div>
          <div className="mb-6 flex flex-col justify-between h-14">
            <h2 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]">
              Rank in Order
            </h2>
            <p className="text-sm text-[#01472e]/60">
              {selectedPriorities.length === 0
                ? 'Select at least 1 factor.'
                : 'Drag to reorder from most to least important.'}
            </p>
          </div>

          <div className="relative min-h-[300px]">
            {selectedPriorities.length > 0 ? (
              <div className="space-y-3">
                {selectedPriorities.map((factor, index) => (
                  <div
                    key={factor}
                    draggable
                    onDragStart={(e) => handleDragStart(e, factor)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={clsx(
                      'group flex items-center gap-4 p-4 bg-[#fefae0] border border-[#01472e]/10 rounded-2xl transition-all duration-400 ease-premium cursor-move hover:shadow-md',
                      draggedItem === factor && 'opacity-50',
                      dragOverIndex === index && draggedItem !== factor && 'border-forest border-t-2'
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-[#01472e]/40 group-hover:text-[#01472e]/70 transition-colors" />
                    <div className="w-6 h-6 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[10px] font-bold text-[#01472e]">
                      {index + 1}
                    </div>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e] flex-1">{factor}</span>
                    <button
                      onClick={() => handleSelectPriority(factor)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#ccd5ae]/40 rounded-full text-[#01472e]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 border-2 border-dashed border-[#01472e]/15 rounded-[2.5rem] flex items-center justify-center bg-sage/15">
                <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e]/40">
                  {selectedPriorities.length}/10 Selected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Button
          onClick={handleGenerate}
          disabled={selectedPriorities.length === 0 || isLoading}
          size="lg"
          className="w-full max-w-sm shadow-md"
        >
          {isLoading ? (
            <span className="animate-pulse">
              Analyzing Priorities...
            </span>
          ) : (
            'View Insights'
          )}
        </Button>
      </div>
    </div>
  )
}
