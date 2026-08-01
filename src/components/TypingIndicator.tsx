import { useEffect, useRef, useState } from 'react';

interface TypingIndicatorProps {
  text?: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypingIndicator({ text, speed = 30, onComplete }: TypingIndicatorProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }

    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [currentIndex, text, speed]);

  if (!text) {
    return (
      <div className="flex items-center space-x-1.5">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {displayedText}
      {currentIndex < text.length && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-500" />
      )}
    </div>
  );
}
