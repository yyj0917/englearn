import { useAuthStore } from '../../store/auth-store';

export function UserInfo() {
  const email = useAuthStore(s => s.email);
  const provider = useAuthStore(s => s.provider);
  const avatarUrl = useAuthStore(s => s.avatarUrl);
  const userName = useAuthStore(s => s.userName);

  return (
    <section className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
      {/* 헤더 영역 - 카카오 느낌의 밝은 톤 + primary 포인트 */}
      <div
        className='relative px-5 py-6'
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 18%, white) 0%, white 100%)',
        }}
      >
        <div className='flex items-center gap-4'>
          {/* 아바타 */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt='avatar'
              className='h-14 w-14 rounded-full border bg-white object-cover shadow-sm'
              style={{ borderColor: 'var(--color-primary)' }}
            />
          ) : (
            <div
              className='flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-sm'
              style={{ borderColor: 'var(--color-primary)' }}
              aria-hidden
            >
              <span
                className='text-lg font-bold'
                style={{ color: 'var(--color-primary)' }}
              >
                {(userName ?? email ?? 'U')?.[0]?.toUpperCase()}
              </span>
            </div>
          )}

          {/* 기본 정보 */}
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <h2 className='truncate text-base font-semibold text-gray-900'>
                {userName ?? '로그인이 필요합니다'}
              </h2>
              {provider && (
                <span
                  className='inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                  style={{
                    backgroundColor: 'color-mix(in oklab, #FEE500, white)',
                    color: 'oklch(0.45 0.05 240)',
                    border: '1px solid color-mix(in oklab, #FEE500, white)',
                  }}
                >
                  {provider}
                </span>
              )}
            </div>
            <p className='mt-0.5 line-clamp-1 text-xs text-gray-500'>
              Email: {email ?? '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 내용 영역 */}
      <div
        className='grid grid-cols-3 divide-x divide-gray-100 bg-white'
        role='list'
      >
        <div className='p-4 text-center'>
          <div className='text-[11px] text-gray-500'>이메일</div>
          <div className='mt-1 truncate text-sm font-medium text-gray-900'>
            {email ?? '-'}
          </div>
        </div>
        <div className='p-4 text-center'>
          <div className='text-[11px] text-gray-500'>로그인</div>
          <div
            className='mt-1 text-sm font-medium'
            style={{ color: 'var(--color-primary)' }}
          >
            {provider ? '연결됨' : '연결 안 됨'}
          </div>
        </div>
        <div className='p-4 text-center'>
          <div className='text-[11px] text-gray-500'>상태</div>
          <div className='mt-1 text-sm font-medium text-gray-900'>활성</div>
        </div>
      </div>
    </section>
  );
}
