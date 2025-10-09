import { Logout } from '../../components/mypage/Logout';
import { MajorCategoryManager } from '../../components/mypage/MajorCategoryManager';
import { UploadedWords } from '../../components/mypage/UploadedWords';
import { UserInfo } from '../../components/mypage/UserInfo';

export function MyPage() {
  return (
    <div className='h-full w-full overflow-y-auto p-6'>
      <div className='mx-auto w-full max-w-2xl space-y-6'>
        <UserInfo />
        <MajorCategoryManager />
        <UploadedWords />
        <Logout />
      </div>
    </div>
  );
}
