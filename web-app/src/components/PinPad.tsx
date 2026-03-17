"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PinPadProps {
    onPinSubmit: (pin: string) => void;
    loading?: boolean;
}

export function PinPad({ onPinSubmit, loading = false }: PinPadProps) {
    const [pin, setPin] = useState("");

    const handlePress = (digit: string) => {
        if (pin.length < 4) {
            setPin((prev) => prev + digit);
        }
    };

    const handleBackspace = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    const handleSubmit = () => {
        if (pin.length === 4) {
            onPinSubmit(pin);
            // Wait to clear until success/failure prop is handled outside
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            {/* PIN Display */}
            <div className="flex gap-4">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`w-12 h-16 rounded-lg flex items-center justify-center text-3xl font-bold
              ${pin.length > index ? "bg-zinc-800 text-white border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-900 text-transparent border-2 border-zinc-700"}
              transition-all duration-200`}
                    >
                        {pin.length > index ? "•" : ""}
                    </div>
                ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-4 w-full px-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                        key={num}
                        type="button"
                        variant="outline"
                        className="h-16 text-2xl font-semibold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                        onClick={() => handlePress(num.toString())}
                        disabled={loading}
                    >
                        {num}
                    </Button>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    className="h-16 text-xl bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white text-rose-500"
                    onClick={handleBackspace}
                    disabled={loading || pin.length === 0}
                >
                    DEL
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-16 text-2xl font-semibold bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                    onClick={() => handlePress("0")}
                    disabled={loading}
                >
                    0
                </Button>
                <Button
                    type="button"
                    className="h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={handleSubmit}
                    disabled={loading || pin.length < 4}
                >
                    ENTER
                </Button>
            </div>
        </div>
    );
}
