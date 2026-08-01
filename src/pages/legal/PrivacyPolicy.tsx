import { Shield } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="privacyPolicy"
      icon={<Shield className="h-8 w-8" />}
      iconTone="orange"
    />
  );
}
