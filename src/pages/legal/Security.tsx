import { Lock } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface SecurityProps {
  onNavigate: (page: string) => void;
}

export default function Security({ onNavigate }: SecurityProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="security"
      icon={<Lock className="h-8 w-8" />}
      iconTone="green"
    />
  );
}
