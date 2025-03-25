"use client"

import { useState } from "react"
import BlinkingLogoComponent from "@/components/blinking-logo"
import LogoComponent from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function BlinkingLogoPage() {
  const [patternInterval, setPatternInterval] = useState(5000)
  
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-background to-secondary/5">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Blinking Logo Demo</h1>
        <p className="text-muted-foreground">Watch the logo blink its "eyes" with a natural double-blink pattern</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl mb-8">
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border shadow-sm">
          <h2 className="text-lg font-medium mb-6">Standard Logo</h2>
          <div className="border border-primary/20 rounded-full p-8 bg-background">
            <LogoComponent size={180} className="text-primary" />
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border shadow-sm">
          <h2 className="text-lg font-medium mb-6">Blinking Logo</h2>
          <div className="border border-primary/20 rounded-full p-8 bg-background">
            <BlinkingLogoComponent 
              size={180} 
              className="text-primary" 
              patternInterval={patternInterval}
            />
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-lg bg-card rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium mb-4 pb-2 border-b">Customize Blinking</h2>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Pattern Interval: {patternInterval}ms</label>
              <span className="text-xs text-muted-foreground">(Time between double-blink patterns)</span>
            </div>
            <div className="flex gap-3">
              <input 
                type="range" 
                min="2000" 
                max="12000" 
                step="500" 
                value={patternInterval} 
                onChange={(e) => setPatternInterval(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="flex justify-between pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPatternInterval(3000)}
                className="text-xs px-2"
              >
                Frequent (3s)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPatternInterval(5000)}
                className="text-xs px-2"
              >
                Normal (5s)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPatternInterval(9000)}
                className="text-xs px-2"
              >
                Infrequent (9s)
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-medium mb-2">About the Blink Pattern</h3>
            <p className="text-xs text-muted-foreground">
              The logo now blinks with a natural double-blink pattern (blink-blink, pause, blink-blink). 
              Each blink has smooth animation for opening and closing with four stages: open → half-closed → 
              closed → half-open → open.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {[24, 48, 64, 96].map((size) => (
          <div key={size} className="flex flex-col items-center p-4 bg-card rounded-xl border">
            <p className="text-xs mb-2">{size}px</p>
            <BlinkingLogoComponent 
              size={size} 
              className="text-primary" 
              patternInterval={patternInterval}
            />
          </div>
        ))}
      </div>
    </div>
  )
}