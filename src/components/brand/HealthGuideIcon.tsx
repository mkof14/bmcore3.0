interface HealthGuideIconProps {
  className?: string;
  size?: number;
}

/** BioMath Health Guide brand mark (orange tile + HG). */
export default function HealthGuideIcon({ className = '', size = 24 }: HealthGuideIconProps) {
  return (
    <img
      src="/brand/health-guide-mark.svg?v=2"
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={`inline-block shrink-0 object-contain ${className}`.trim()}
    />
  );
}
