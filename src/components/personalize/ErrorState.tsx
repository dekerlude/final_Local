'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden animate-fade-in">
      <div className="max-w-md w-full mx-auto px-6 relative z-10">
        <Card className="p-10 bg-[#e9edc9]/50 border border-[#01472e]/10 text-center rounded-[2.5rem] shadow-lg">
          <div className="mb-6">
            <AlertCircle className="w-12 h-12 text-[#7f1d1d] mx-auto" />
          </div>
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#7f1d1d] mb-4">Something Went Wrong</h2>
          <p className="text-[#01472e]/80 mb-8 leading-relaxed font-sans font-medium text-sm">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} className="w-full shadow-md" variant="default">
              Try Again
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
