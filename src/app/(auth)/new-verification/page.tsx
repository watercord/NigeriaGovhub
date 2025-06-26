
import { VerificationForm } from '@/components/auth/verification-form';
import { Suspense } from 'react';

const NewVerificationPage = () => {
  return (
    // Suspense is required because VerificationForm uses useSearchParams
    <Suspense fallback={<VerificationForm.Skeleton />}>
      <VerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
