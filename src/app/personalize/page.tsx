'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PrioritySelector from '@/components/personalize/PrioritySelector'
import ScoreBreakdown from '@/components/personalize/ScoreBreakdown'
import StrengthCard from '@/components/personalize/StrengthCard'
import TradeoffCard from '@/components/personalize/TradeoffCard'
import ErrorState from '@/components/personalize/ErrorState'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { clientCache } from '@/lib/clientCache'
import { LocalityCategoryScores } from '@/types/locality'

type PersonalizationStep = 'select' | 'results' | 'summary'

interface PersonalizationResult {
  personalizedScore: number
  factorBreakdown: Record<string, number>
  strongestFactors: string[]
  weakestFactors: string[]
}

const PRIORITY_KEY_MAP: Record<string, keyof LocalityCategoryScores> = {
  'Safety & Crime': 'safetyAndCrime',
  'Environment & Air Quality': 'environmentAndAirQuality',
  'Public Transport': 'publicTransport',
  'Basic Amenities': 'basicAmenities',
  'Schools': 'schools',
  'Healthcare': 'healthcare',
  'Affordability': 'affordability',
  'Nightlife': 'nightlife',
  'Parks & Recreation': 'parksAndRecreation',
  'Traffic & Commute': 'trafficAndCommute',
  'Walkability': 'walkability',
  'Restaurants': 'restaurants',
  'Shopping': 'shopping',
  'Family Friendly': 'familyFriendly',
}

function PersonalizeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const neighborhoodId = searchParams.get('neighborhoodId')

  const [step, setStep] = useState<PersonalizationStep>('select')
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [result, setResult] = useState<PersonalizationResult | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!neighborhoodId) {
      setError('No neighborhood selected')
    }
  }, [neighborhoodId])

  const handlePrioritiesSelected = (priorities: string[]) => {
    setSelectedPriorities(priorities)
    setError('')

    // 1. Retrieve cached locality data instantly
    let localityData = undefined;
    try {
      const stored = sessionStorage.getItem('current_locality_data');
      if (stored) {
        localityData = JSON.parse(stored);
      }
    } catch (e) {}

    if (!localityData && neighborhoodId) {
      localityData = clientCache.get(neighborhoodId);
    }

    if (!localityData || !localityData.categoryScores) {
      setError('Locality data missing from cache. Please search again to fetch the locality report.');
      return;
    }

    const scores = localityData.categoryScores;
    
    // 2. Calculate Deterministic Score (O(N) operation, <1ms)
    let totalWeight = 0;
    let weightedSum = 0;
    const factorBreakdown: Record<string, number> = {};
    
    priorities.forEach((p, index) => {
      const weight = priorities.length - index; // Highest ranked priority gets highest weight
      const scoreKey = PRIORITY_KEY_MAP[p];
      const factorScore = scores[scoreKey] || 50; // Fallback to 50 if key is somehow missing
      
      weightedSum += factorScore * weight;
      totalWeight += weight;
      factorBreakdown[p] = factorScore;
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;

    // 3. Identify strongest and weakest factors for the UI
    const sortedFactors = [...priorities].sort((a, b) => factorBreakdown[b] - factorBreakdown[a]);
    const strongestFactors = sortedFactors.slice(0, 3);
    const weakestFactors = sortedFactors.slice(-3).reverse();

    setResult({
      personalizedScore: finalScore,
      factorBreakdown,
      strongestFactors,
      weakestFactors
    });
    
    // 4. Transition instantly to summary
    setStep('summary');
  }

  const handleReset = () => {
    // Keep the priorities selected in state so the user doesn't have to start from scratch,
    // just pop them back to the selection screen.
    setStep('select')
  }

  if (!neighborhoodId) {
    return (
      <ErrorState
        message="No neighborhood selected. Please go back and select a neighborhood."
        onRetry={() => router.back()}
      />
    )
  }

  if (error && step === 'select') {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="min-h-screen bg-bg-primary relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-12"
        >
          <div className="max-w-3xl mx-auto relative z-10">
            {/* Header */}
            <div className="mb-16 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#01472e] mb-4 block">
                Preferences Blueprint
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-display uppercase leading-tight text-[#01472e] mb-6">
                What matters<br />to you?
              </h1>
              <p className="text-base text-[#01472e]/80 max-w-xl mx-auto font-sans leading-relaxed">
                Select your priorities to calculate a custom neighborhood compatibility score aligned with your lifestyle.
              </p>
            </div>

            {/* Step: Select Priorities */}
            {step === 'select' && (
              <PrioritySelector
                onPrioritiesSelected={handlePrioritiesSelected}
                isLoading={false}
              />
            )}

            {/* Step: Show Instant Results */}
            {step === 'summary' && result && (
              <div className="space-y-8 animate-fade-in">
                <ScoreBreakdown
                  personalizedScore={result.personalizedScore}
                  priorities={selectedPriorities}
                />

                <div>
                  <h3 className="text-2xl font-bold text-[#01472e] mb-6">Neighborhood Strengths</h3>
                  <div className="space-y-3">
                    {result.strongestFactors.map((factor) => (
                      <StrengthCard key={factor} factor={factor} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#01472e] mb-6">
                    Areas to Consider
                  </h3>
                  <div className="space-y-3">
                    {result.weakestFactors.map((factor) => (
                      <TradeoffCard key={factor} factor={factor} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-[#01472e]/10">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Adjust Priorities
                  </Button>

                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

export default function Personalize() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <PersonalizeContent />
    </Suspense>
  )
}
