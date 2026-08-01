import { Shield } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface HIPAANoticeProps {
  onNavigate: (page: string) => void;
}

export default function HIPAANotice({ onNavigate }: HIPAANoticeProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="hipaaNotice"
      icon={<Shield className="h-8 w-8" />}
      iconTone="blue"
      ctaTarget="privacy-policy"
    />
  );
}
