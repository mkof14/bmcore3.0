import Footer from './Footer';

interface MemberFooterProps {
  onNavigate: (page: string) => void;
  onSectionChange?: (section: string) => void;
}

/**
 * Member Zone footer — full site-footer content, constrained to the content
 * column (right of the sidebar) with a taller stacked layout and member tokens.
 */
export default function MemberFooter({ onNavigate, onSectionChange }: MemberFooterProps) {
  return (
    <Footer onNavigate={onNavigate} variant="member" onSectionChange={onSectionChange} />
  );
}
