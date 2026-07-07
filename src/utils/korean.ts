/**
 * 한글 이름 뒤에 알맞은 조사(이/가, 은/는, 을/를)를 리턴합니다.
 */
export function getPostposition(name: string, type: '이/가' | '은/는' | '을/를'): string {
  if (!name) return '';
  const lastChar = name.charCodeAt(name.length - 1);
  
  // 한글 유니코드 범위: 가(0xAC00) ~ 힣(0xD7A3)
  if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
    // 종성(받침) 여부 확인: (한글코드 - 0xAC00) % 28 !== 0 이면 받침 있음
    const hasLast = (lastChar - 0xAC00) % 28 !== 0;
    if (type === '이/가') return hasLast ? '이' : '가';
    if (type === '은/는') return hasLast ? '은' : '는';
    if (type === '을/를') return hasLast ? '을' : '를';
  }
  
  // 한글이 아니거나 범위를 벗어나면 첫 번째 선택지 기본값 제공
  return type.split('/')[0];
}
