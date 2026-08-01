import { FileText } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';

interface TermsOfServiceProps {
  onNavigate: (page: string) => void;
}

export default function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  return (
    <LegalDocument
      onNavigate={onNavigate}
      docKey="termsOfService"
      icon={<FileText className="h-8 w-8" />}
      iconTone="blue"
    />
  );
}
