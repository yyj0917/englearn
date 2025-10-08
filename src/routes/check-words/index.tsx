import { CheckWordSection } from '../../components/check-words/CheckWordSection';

export function CheckWords() {
  return (
    <div className='h-full w-full overflow-y-auto p-6'>
      <div className='mx-auto w-full max-w-2xl space-y-8'>
        <CheckWordSection />
      </div>
    </div>
  );
}
