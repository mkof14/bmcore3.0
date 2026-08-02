import type { ReactNode } from 'react';

type StateCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export default function StateCard({ title, description, icon, className }: StateCardProps) {
  return (
    <div className={`member-card rounded-xl p-10 text-center ${className || ''}`}>
      {icon && <div className="mb-4 flex justify-center member-muted">{icon}</div>}
      <p className="text-lg font-semibold member-heading mb-2">{title}</p>
      {description && <p className="text-sm member-body">{description}</p>}
    </div>
  );
}
