import { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  type: 'microphone' | 'speaker';
  intensity?: number;
}

export default function AudioVisualizer({ isActive, type, intensity = 0.5 }: AudioVisualizerProps) {
  const barsCount = 8;
  const [barHeights, setBarHeights] = useState<number[]>(Array(barsCount).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBarHeights(Array(barsCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBarHeights(
        Array.from({ length: barsCount }, () =>
          Math.random() * 60 * intensity + 20
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, intensity, barsCount]);

  const getBarColor = (index: number) => {
    if (!isActive) return 'bg-gray-300 dark:bg-neutral-600';

    if (type === 'microphone') {
      const colors = [
        'bg-orange-600',
        'bg-orange-500',
        'bg-orange-400',
        'bg-yellow-500',
        'bg-yellow-400',
        'bg-orange-400',
        'bg-orange-500',
        'bg-orange-600',
      ];
      return colors[index];
    }

    const colors = [
      'bg-orange-600',
      'bg-orange-500',
      'bg-orange-400',
      'bg-amber-500',
      'bg-amber-400',
      'bg-orange-400',
      'bg-orange-500',
      'bg-orange-600',
    ];
    return colors[index];
  };

  return (
    <div className="flex h-5 items-center gap-0.5" aria-hidden>
      {barHeights.map((height, index) => (
        <div
          key={index}
          className={`w-0.5 rounded-full transition-all duration-100 ${getBarColor(index)}`}
          style={{ height: `${Math.max(18, height)}%` }}
        />
      ))}
    </div>
  );
}
