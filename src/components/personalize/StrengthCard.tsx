'use client'

import { CheckCircle } from 'lucide-react'

interface StrengthCardProps {
  factor: string
}

export default function StrengthCard({ factor }: StrengthCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#e9edc9] rounded-2xl border border-[#01472e]/10 hover:border-[#01472e]/20 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-[#01472e]/10 flex items-center justify-center flex-shrink-0 text-[#01472e]">
        <CheckCircle className="w-4 h-4" />
      </div>
      <div>
        <p className="font-sans font-bold text-xs uppercase tracking-wider text-[#01472e]">{factor}</p>
      </div>
    </div>
  )
}
