// app/docket/edit/page.tsx
import DocketEditContent from './DocketEditContent';

export default function EditDocketPage() {
  // This runs on the server at build time, but just returns a component
  return <DocketEditContent />;
}