import { Globe } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface GDPRProps {
  onNavigate: (page: string) => void;
}

export default function GDPR({ onNavigate }: GDPRProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="gdpr"
      icon={<Globe className="h-8 w-8" />}
      iconTone="blue"
    />
  );
}
