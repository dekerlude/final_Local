'use client'

import { AlertCircle } from 'lucide-react'

interface TradeoffCardProps {
  factor: string
}

export default function TradeoffCard({ factor }: TradeoffCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#7f1d1d]/5 rounded-2xl border border-[#7f1d1d]/10 hover:border-[#7f1d1d]/20 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-[#7f1d1d]/10 flex items-center justify-center flex-shrink-0 text-[#7f1d1d]">
        <AlertCircle className="w-4 h-4" />
      </div>
      <div>
        <p className="font-sans font-bold text-xs uppercase tracking-wider text-[#7f1d1d]">{factor}</p>
      </div>
    </div>
  )
}
