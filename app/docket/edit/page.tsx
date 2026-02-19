// app/docket/edit/page.tsx
import { Suspense } from 'react';
import DocketEditContent from './DocketEditContent';
import LoadingSpinner from '@/components/LoadingSpinner';
import DocketViewContent from '../view/DocketViewContent';
export default function EditDocketPage() {
  // This runs on the server at build time, but just returns a component
    return (
        <Suspense fallback={<LoadingSpinner />}>

            <DocketEditContent />;
        </Suspense>
    )
}


