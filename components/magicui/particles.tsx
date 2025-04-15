"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  refresh?: boolean
  color?: string
  varyColor?: boolean
  varySize?: boolean
  disableMotion?: boolean
}

interface ParticlesRefType extends HTMLCanvasElement {
  shouldReduceMotion?: boolean
}

export const Particles = ({
  className,
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#ffffff",
  varyColor = false,
  varySize = false,
  disableMotion = false,
}: ParticlesProps) => {
  const canvasRef = useRef<ParticlesRefType>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<any[]>([])
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [shouldReduceMotion, setShouldReduceMotion] = useState(disableMotion)
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvas()
    animate()
    window.addEventListener("resize", initCanvas)
    
    if (!disableMotion) {
      // Check for reduced motion preference
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setShouldReduceMotion(motionQuery.matches)
      
      const handleMotionChange = () => setShouldReduceMotion(motionQuery.matches)
      motionQuery.addEventListener("change", handleMotionChange)
      
      return () => {
        window.removeEventListener("resize", initCanvas)
        motionQuery.removeEventListener("change", handleMotionChange)
      }
    }
    
    return () => window.removeEventListener("resize", initCanvas)
  }, [color, disableMotion])

  useEffect(() => {
    if (refresh) {
      initCanvas()
    }
  }, [refresh])

  const initCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = []
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)
      
      // Generate particles
      for (let i = 0; i < quantity; i++) {
        const particleColor = varyColor 
          ? `hsl(${Math.random() * 360}, 75%, 75%)` 
          : color
        
        const size = varySize 
          ? Math.floor(Math.random() * 3) + 1
          : 1
          
        circles.current.push({
          x: Math.random() * canvasSize.current.w,
          y: Math.random() * canvasSize.current.h,
          translateX: 0,
          translateY: 0,
          size: size,
          alpha: 0,
          targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          magnetism: 0.1 + Math.random() * 4,
          color: particleColor,
        })
      }
    }
  }

  const animate = () => {
    if (
      !context.current ||
      !canvasRef.current ||
      shouldReduceMotion
    ) {
      return
    }
    
    context.current.clearRect(
      0,
      0,
      canvasSize.current.w,
      canvasSize.current.h
    )
    
    // Update mouse position with easing
    mouse.current.x += (mousePosition.current.x - mouse.current.x) / ease
    mouse.current.y += (mousePosition.current.y - mouse.current.y) / ease
    
    // Draw and animate each particle
    circles.current.forEach((circle: any, i: number) => {
      const edge = [
        circle.x + circle.translateX - circle.size, // Distance from left edge
        canvasSize.current.w - circle.x - circle.translateX - circle.size, // Distance from right edge
        circle.y + circle.translateY - circle.size, // Distance from top edge
        canvasSize.current.h - circle.y - circle.translateY - circle.size, // Distance from bottom edge
      ]
      
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      )
      
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge
      }
      
      circle.x += circle.dx
      circle.y += circle.dy
      
      // Boundary checking
      if (circle.x < 0 || circle.x > canvasSize.current.w) circle.dx *= -1
      if (circle.y < 0 || circle.y > canvasSize.current.h) circle.dy *= -1
      
      // Apply magnetism effect
      if (mouse.current.x && mouse.current.y) {
        const distX = mouse.current.x - circle.x
        const distY = mouse.current.y - circle.y
        const distance = Math.sqrt(distX ** 2 + distY ** 2)
        const normalizedDist = distance / staticity
        const force = (1 - normalizedDist) ** 2
        
        if (distance < staticity) {
          circle.translateX = -distX * force
          circle.translateY = -distY * force
        } else {
          circle.translateX += (0 - circle.translateX) / ease
          circle.translateY += (0 - circle.translateY) / ease
        }
      }
      
      // Draw the circle
      context.current.globalAlpha = circle.alpha
      context.current.fillStyle = circle.color
      context.current.beginPath()
      context.current.arc(
        circle.x + circle.translateX,
        circle.y + circle.translateY,
        circle.size,
        0,
        2 * Math.PI
      )
      context.current.fill()
    })
    
    window.requestAnimationFrame(animate)
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current && !shouldReduceMotion) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { w, h } = canvasSize.current
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const mx = (x / w)
      const my = (y / h)
      mousePosition.current = { x: mx * w, y: my * h }
    }
  }

  const remapValue = (
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) => {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
  }

  return (
    <div
      ref={canvasContainerRef}
      className={cn("fixed inset-0 z-0", className)}
      onMouseMove={onMouseMove}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  )
}
