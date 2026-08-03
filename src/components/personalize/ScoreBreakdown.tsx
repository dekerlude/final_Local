'use client'

import { Badge } from '@/components/ui/badge'

interface ScoreBreakdownProps {
  personalizedScore: number
  priorities: string[]
}

export default function ScoreBreakdown({
  personalizedScore,
  priorities,
}: ScoreBreakdownProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Very Good'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Score Display */}
      <div className="flex-1">
        <div className="h-full p-10 bg-[#01472e] text-[#fefae0] border-none flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden rounded-[2.5rem]">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#fefae0]/80 mb-6 relative z-10">
            Personalized Score
          </p>
          <div className="text-8xl font-display text-[#fefae0] leading-none mb-4 relative z-10">
            {personalizedScore.toFixed(0)}
          </div>
          <div className="flex flex-col items-center gap-3 mt-2 relative z-10">
            <Badge variant="secondary" className="bg-[#fefae0] text-[#01472e] font-sans font-bold uppercase tracking-wider px-5 py-2 text-xs shadow-md border-none">
              {getScoreLabel(personalizedScore)} Match
            </Badge>
          </div>
        </div>
      </div>

      {/* Your Priorities List */}
      <div className="bg-bg-primary border border-border rounded-[2.5rem] p-8 shadow-sm">
        <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#01472e] mb-6">Your Ranking</h3>
        <div className="space-y-3">
          {priorities.map((priority, index) => (
            <div
              key={priority}
              className="flex items-center gap-4 p-3 bg-secondary/40 rounded-2xl border border-transparent hover:border-[#01472e]/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#01472e]/10 flex items-center justify-center text-[10px] font-bold text-[#01472e]">
                {index + 1}
              </div>
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e] flex-1">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
