'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { TaxPdfSync } from './tax-pdf-sync'

interface CalculatorProps {
  taxRate?: number
  isMvaRegistered?: boolean
}

export function SafeToSpendCalculator({ taxRate = 35, isMvaRegistered = false }: CalculatorProps) {
  const [grossInput, setGrossInput] = useState<string>('')

  const calculations = useMemo(() => {
    const gross = parseFloat(grossInput) || 0
    let remaining = gross

    // 1. MVA (25% rate means 20% of gross if including MVA, or 25% on top)
    // PRD says: "If user is MVA Registered, subtract 20% (standard 25% rate) from gross"
    const mvaReserved = isMvaRegistered ? gross * 0.20 : 0
    remaining -= mvaReserved

    // 2. National Insurance (~11.0% trygdeavgift)
    // Usually calculated on net income. For simplicity here:
    const nationalInsurance = remaining * 0.11

    // 3. Tax
    const taxReserved = (remaining - nationalInsurance) * (taxRate / 100)

    const netProfit = remaining - nationalInsurance - taxReserved

    return {
      mvaReserved,
      taxReserved: taxReserved + nationalInsurance, // Combined tax + trygdeavgift for display
      netProfit
    }
  }, [grossInput, taxRate, isMvaRegistered])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Income Entry & Configuration</CardTitle>
          <CardDescription>Enter your gross income and sync your tax profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gross-income">Gross Income (NOK)</Label>
              <Input
                id="gross-income"
                type="number"
                placeholder="0.00"
                value={grossInput}
                onChange={(e) => setGrossInput(e.target.value)}
                className="text-2xl h-14"
              />
            </div>
            <TaxPdfSync />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardDescription>MVA Reserve</CardDescription>
          <CardTitle className="text-2xl">
            {calculations.mvaReserved.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {isMvaRegistered ? '20% of gross income' : 'Not MVA registered'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardDescription>Tax Reserve</CardDescription>
          <CardTitle className="text-2xl">
            {calculations.taxReserved.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            Tax ({taxRate}%) + National Insurance (11%)
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-green-50/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-green-700">Safe-to-Spend (Profit)</CardDescription>
          <CardTitle className="text-2xl text-green-700">
            {calculations.netProfit.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">
            This is yours to keep after taxes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
