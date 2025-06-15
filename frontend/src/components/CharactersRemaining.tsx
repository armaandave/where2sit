"use client"

import React from "react"

interface CharactersRemainingProps {
    value: string;
    maxLength: number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // For additional styling from parent
    as?: 'input' | 'textarea'; // To specify which element to render
    required?: boolean; // Pass required prop down
    pattern?: string;   // Pass pattern prop down for input
    rows?: number;      // Pass rows prop down for textarea
}

function CharactersRemaining({ value, maxLength, onChange, placeholder, className, as = 'input', required, pattern, rows }: CharactersRemainingProps) {
    const charactersRemaining = maxLength - value.length;
    const isError = charactersRemaining < 0;

    // Base classes for ShadCN Input and Textarea, simplified for clarity
    const baseClasses = "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    const inputSpecificClasses = "h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium";
    const textareaSpecificClasses = "min-h-[80px]";

    const elementClasses = as === 'textarea' ? `${baseClasses} ${textareaSpecificClasses}` : `${baseClasses} ${inputSpecificClasses}`;

    return (
        <div className="relative"> {/* Parent div for relative positioning */}
            {as === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`${elementClasses} ${className} pr-12`} // Add padding-right to make space for counter
                    required={required}
                    rows={rows}
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`${elementClasses} ${className} pr-12`} // Add padding-right to make space for counter
                    required={required}
                    pattern={pattern}
                />
            )}
            <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${isError ? 'text-red-500' : 'text-gray-400'}`}
            >
                {charactersRemaining}
            </span>
        </div>
    )
}

export default CharactersRemaining 