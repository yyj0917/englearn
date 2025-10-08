import { WordSection } from '../../components/home/WordSection';

export function Home() {
  return (
    <div className='relative h-full w-full overflow-y-auto p-6'>
      <div className='mx-auto w-full max-w-2xl space-y-8'>
        <WordSection />
      </div>
      {/* <FloatingButton /> */}
    </div>
  );
}
