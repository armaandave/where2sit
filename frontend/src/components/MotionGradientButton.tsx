"use client"

import { motion, useMotionValue, useTransform } from "motion/react"
import { useEffect, useRef, useState, useCallback } from "react"

interface MotionGradientButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string; // Optional for external styling
}

export default function MotionGradientButton({ onClick, children, className }: MotionGradientButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, top: 0, left: 0 })
    const gradientX = useMotionValue(0.5)
    const gradientY = useMotionValue(0.5)

    const measure = useCallback(() => {
        if (!ref.current) return
        setDimensions(ref.current.getBoundingClientRect())
    }, [])

    useEffect(() => {
        measure()
        // Re-measure on resize or scroll if needed, though for a button, initial measure might be enough
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure);
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure);
        };
    }, [measure])

    const background = useTransform(
        () =>
            `conic-gradient(from 0deg at ${gradientX.get() * 100}% ${gradientY.get() * 100}%, #059669, #34d399, #22d3ee, #059669)`
    )

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            className={`relative overflow-hidden inline-flex items-center justify-center rounded-lg font-bold transition-all duration-300 ease-in-out group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${className || 'px-6 py-3 text-lg text-white'}
            `}
            onPointerMove={(e: React.PointerEvent<HTMLButtonElement>) => {
                if (ref.current) {
                    const rect = ref.current.getBoundingClientRect();
                    const newGradientX = (e.clientX - rect.left) / rect.width;
                    const newGradientY = (e.clientY - rect.top) / rect.height;
                    gradientX.set(newGradientX);
                    gradientY.set(newGradientY);
                }
            }}
            onPointerEnter={() => measure()}
        >
            <motion.div
                style={{
                    background: useTransform(
                        () =>
                            `radial-gradient(circle at ${gradientX.get() * 100}% ${gradientY.get() * 100}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 30%, transparent 70%)`
                    ),
                    position: 'absolute',
                    inset: '0',
                    zIndex: 0,
                    opacity: 1,
                    filter: 'blur(15px)',
                }}
                className="absolute"
            />
            <span className="relative z-10 text-white leading-none">
                {children}
            </span>
        </motion.button>
    )
} 