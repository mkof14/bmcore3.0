import { AlertTriangle } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface DisclaimerProps {
  onNavigate: (page: string) => void;
}

export default function Disclaimer({ onNavigate }: DisclaimerProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="disclaimer"
      icon={<AlertTriangle className="h-8 w-8" />}
      iconTone="red"
    />
  );
}
