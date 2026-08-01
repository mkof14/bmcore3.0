import { ShieldCheck } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface TrustSafetyProps {
  onNavigate: (page: string) => void;
}

export default function TrustSafety({ onNavigate }: TrustSafetyProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="trustSafety"
      icon={<ShieldCheck className="h-8 w-8" />}
      iconTone="green"
    />
  );
}
