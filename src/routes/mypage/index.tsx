import { Logout } from '../../components/mypage/Logout';
import { UploadedWords } from '../../components/mypage/UploadedWords';
import { UserInfo } from '../../components/mypage/UserInfo';

export function MyPage() {
  return (
    <div className='h-full w-full overflow-y-auto p-6'>
      <div className='mx-auto w-full max-w-2xl space-y-6'>
        <UserInfo />
        <UploadedWords table='dontknow_word' />
        <Logout />
      </div>
    </div>
  );
}
