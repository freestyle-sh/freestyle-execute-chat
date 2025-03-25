"use client"

import { useState } from "react"
import { AuthPopup } from "@/components/ui/auth-popup"
import { Button } from "@/components/ui/button"
import LogoComponent from "@/components/logo"

export default function PopupPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [message, setMessage] = useState("To send more messages please sign in")
  const [title, setTitle] = useState("Authentication Required")
  const [ctaText, setCtaText] = useState("Sign In")
  
  const messageOptions = [
    "To send more messages please sign in",
    "To enable this module please sign in",
    "To access this feature please sign in",
    "To continue your conversation please sign in"
  ]
  
  const titleOptions = [
    "Authentication Required",
    "Sign in Required",
    "Account Required",
    "Freestyle Account Needed"
  ]
  
  const ctaOptions = [
    "Sign In",
    "Create Account",
    "Continue to Sign In",
    "Get Started"
  ]
  
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-background to-secondary/10">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <LogoComponent size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Auth Popup Demo</h1>
        </div>
        <p className="text-muted-foreground text-sm">Customizable, inviting authentication popup</p>
      </div>
      
      <div className="w-full max-w-md bg-card rounded-xl border shadow-sm p-6 mb-8 animate-slide-up">
        <h2 className="text-lg font-medium mb-4 pb-2 border-b">Customize Popup</h2>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <div className="grid grid-cols-1 gap-2">
              {messageOptions.map((opt) => (
                <Button 
                  key={opt}
                  variant={message === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessage(opt)}
                  className="justify-start h-auto py-2 text-left text-xs"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Title:</label>
            <div className="grid grid-cols-2 gap-2">
              {titleOptions.map((opt) => (
                <Button 
                  key={opt}
                  variant={title === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTitle(opt)}
                  className="h-auto py-2"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">CTA Button:</label>
            <div className="grid grid-cols-2 gap-2">
              {ctaOptions.map((opt) => (
                <Button 
                  key={opt}
                  variant={ctaText === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCtaText(opt)}
                  className="h-auto py-2"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full max-w-md py-6 text-base font-medium"
      >
        Show Auth Popup
      </Button>
      
      <AuthPopup 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message={message}
        title={title}
        ctaText={ctaText}
      />
    </div>
  )
}