// app/docket/view/page.tsx
import { Suspense } from 'react';
import DocketViewContent from './DocketViewContent';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DocketViewPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DocketViewContent />
    </Suspense>
  );
}