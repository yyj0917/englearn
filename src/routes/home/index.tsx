import { WordSection } from '../../components/home/WordSection';

export function Home() {
  return (
    <div className='h-full w-full overflow-y-auto p-6'>
      <div className='mx-auto w-full max-w-2xl space-y-8'>
        <WordSection title='모르는 단어들' table='dontknow_word' />
        {/* <WordSection title='최근 등록한 전문 용어' table='jargon_word' /> */}
      </div>
    </div>
  );
}
