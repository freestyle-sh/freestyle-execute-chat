"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import type { SVGProps } from "react"

type BlinkStage = "open" | "half-closed" | "closed" | "half-open"

export default function BlinkingLogoComponent({
  size = 24,
  patternInterval = 5000, // Time between blink patterns in ms
  ...props
}: {
  size?: number
  patternInterval?: number
} & SVGProps<SVGSVGElement>) {
  const [blinkStage, setBlinkStage] = useState<BlinkStage>("open")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Define the animation sequence as an array of [stage, duration] tuples
  const doubleBlink = () => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // First blink animation sequence (150ms per stage)
    const stageTime = 100 // ms per stage
    
    // First blink
    setBlinkStage("half-closed")
    
    timeoutRef.current = setTimeout(() => {
      setBlinkStage("closed")
      
      timeoutRef.current = setTimeout(() => {
        setBlinkStage("half-open")
        
        timeoutRef.current = setTimeout(() => {
          setBlinkStage("open")
          
          // Short pause between the two blinks (200ms)
          timeoutRef.current = setTimeout(() => {
            // Second blink
            setBlinkStage("half-closed")
            
            timeoutRef.current = setTimeout(() => {
              setBlinkStage("closed")
              
              timeoutRef.current = setTimeout(() => {
                setBlinkStage("half-open")
                
                timeoutRef.current = setTimeout(() => {
                  setBlinkStage("open")
                }, stageTime)
              }, stageTime)
            }, stageTime)
          }, 200)
        }, stageTime)
      }, stageTime)
    }, stageTime)
  }

  useEffect(() => {
    // Randomize the first blink pattern to make it feel more natural
    const initialDelay = Math.floor(Math.random() * 2000) + 1000
    const initialTimer = setTimeout(doubleBlink, initialDelay)
    
    // Set up interval for regular blinking patterns
    const blinkPatternTimer = setInterval(() => {
      doubleBlink()
    }, patternInterval)

    // Clean up timers on unmount
    return () => {
      clearTimeout(initialTimer)
      clearInterval(blinkPatternTimer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [patternInterval])

  // Calculate the eye line length based on blink stage
  const getEyePathData = (baseX: number) => {
    // The eye line goes from Y=237 to Y=267 when fully open
    switch (blinkStage) {
      case "open":
        return `M${baseX} 237V267`
      case "half-closed":
        return `M${baseX} 247V267`
      case "closed":
        return `M${baseX} 257V267`
      case "half-open":
        return `M${baseX} 247V267`
      default:
        return `M${baseX} 237V267`
    }
  }

  // Animation classes based on stage
  const getTransitionClass = () => {
    return "transition-all duration-100"
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      fill="none"
      viewBox="0 0 347 280"
      {...props}
    >
      <title>Freestyle</title>

      <path
        d="M70 267V235.793C37.4932 229.296 13 200.594 13 166.177C13 134.93 33.1885 108.399 61.2324 98.9148C61.9277 51.3467 100.705 13 148.438 13C183.979 13 214.554 34.2582 228.143 64.7527C234.182 63.4301 240.454 62.733 246.89 62.733C295.058 62.733 334.105 101.781 334.105 149.949C334.105 182.845 315.893 211.488 289 226.343V267"
        strokeWidth="25"
        strokeLinecap="round"
      />
      
      {/* Animated left eye */}
      <path 
        d={getEyePathData(146)} 
        strokeWidth="25" 
        strokeLinecap="round" 
        className={getTransitionClass()}
      />
      
      {/* Animated right eye */}
      <path 
        d={getEyePathData(215)} 
        strokeWidth="25" 
        strokeLinecap="round"
        className={getTransitionClass()}
      />
    </svg>
  )
}