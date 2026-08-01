import { Database } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface DataPrivacyProps {
  onNavigate: (page: string) => void;
}

export default function DataPrivacy({ onNavigate }: DataPrivacyProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="dataPrivacy"
      icon={<Database className="h-8 w-8" />}
      iconTone="purple"
      ctaTarget="privacy-policy"
    />
  );
}
