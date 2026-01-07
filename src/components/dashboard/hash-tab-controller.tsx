'use client'

import { useEffect } from 'react'

/**
 * A small utility component that listens for URL hash changes 
 * and clicks the corresponding tab trigger on the dashboard.
 */
export function HashTabController() {
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash) return

      const hashToTab: Record<string, string> = {
        'receipts': 'receipts',
        'history': 'history',
        'deadlines': 'deadlines',
        'safe-to-spend': 'safe-to-spend'
      }

      const targetTab = hashToTab[hash]
      if (targetTab) {
        // Broad selector to find Radix tabs or IDs
        const trigger = (document.querySelector(`button[value="${targetTab}"]`) || 
                        document.querySelector(`[data-value="${targetTab}"]`) ||
                        document.getElementById(`trigger-${targetTab}`)) as HTMLElement
        
        if (trigger) {
          trigger.click()
          // Clear hash to allow re-clicking
          window.location.hash = ''
          window.scrollTo({ top: 120, behavior: 'smooth' })
        }
      }
    }

    // Initial check
    handleHash()

    // Robust polling + event listener
    const interval = setInterval(handleHash, 500)
    window.addEventListener('hashchange', handleHash)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('hashchange', handleHash)
    }
  }, [])

  return null
}
