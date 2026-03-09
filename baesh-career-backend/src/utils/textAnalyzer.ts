import OpenAI from 'openai';
import prisma from './prisma';

const openai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY || '',
  baseURL: process.env.UPSTAGE_BASE_URL || 'https://api.upstage.ai/v1'
});

// 텍스트가 의미 있는 내용인지 확인
function isMeaningfulText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  
  // 한글 자음/모음만 있는 경우 (예: ㅎㄹㅎㄷㅎㄷㄱㅎㄷㄱㅎ)
  const onlyConsonants = /^[ㄱ-ㅎㅏ-ㅣ\s]+$/.test(trimmed);
  if (onlyConsonants && trimmed.length < 10) return false;
  
  // 반복되는 문자만 있는 경우 (예: ㅋㅋㅋㅋ, ㅎㅎㅎ)
  const repeatedChars = /^(.)\1{4,}$/.test(trimmed);
  if (repeatedChars) return false;
  
  // 의미 있는 단어가 있는지 확인 (최소 2글자 이상의 단어)
  const meaningfulWords = trimmed.match(/[가-힣a-zA-Z]{2,}/g);
  if (!meaningfulWords || meaningfulWords.length === 0) return false;
  
  return true;
}

// 텍스트에서 핵심 키워드 추출
export async function extractKeywords(text: string): Promise<string[]> {
  // 의미 없는 텍스트는 빈 배열 반환
  if (!isMeaningfulText(text)) {
    console.log('[키워드 추출] 의미 없는 텍스트 감지, 빈 배열 반환');
    return [];
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'solar-pro3',
      messages: [
        {
          role: 'system',
          content: `당신은 텍스트 분석 전문가입니다. 주어진 텍스트의 실제 내용을 분석하여 해시태그로 사용할 수 있는 키워드를 추출하세요.

중요 규칙:
1. 텍스트에 실제로 언급된 구체적인 내용만 추출하세요
2. 텍스트가 일상적인 대화, 사담, 감정 표현인 경우 "일상", "사담" 태그만 사용하세요
3. 기술(AI, 데이터, 개발 등)이나 비즈니스(창업, 스타트업 등) 관련 내용이 명확히 언급된 경우에만 해당 태그를 사용하세요
4. 내용이 불명확하거나 의미가 없으면 빈 배열 []을 반환하세요
5. 키워드는 2-4개 정도로 제한하세요
6. 응답은 JSON 배열 형태로만 반환하세요

예시:
- "오늘 날씨가 좋네요" → ["일상", "사담"]
- "AI 프로젝트를 시작했습니다" → ["AI", "프로젝트"]
- "ㅋㅋㅋ 재밌네요" → ["일상", "사담"]
- "데이터 분석 결과를 공유합니다" → ["데이터", "분석"]
- "ㅎㄹㅎㄷㅎㄷㄱㅎ" → [] (의미 없는 텍스트)
- "아무말이나" → ["일상", "사담"]`
        },
        {
          role: 'user',
          content: `다음 텍스트를 분석하여 적절한 해시태그를 추출해주세요. 의미가 없거나 불명확하면 빈 배열을 반환하세요:\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    } as any);

    const content = completion.choices[0].message.content || '';
    
    // JSON 배열 파싱 시도
    try {
      const keywords = JSON.parse(content);
      if (Array.isArray(keywords)) {
        return keywords.map((k: string) => k.trim()).filter((k: string) => k.length > 0);
      }
    } catch {
      // JSON 파싱 실패 시 텍스트에서 추출
      const lines = content.split('\n').filter(line => line.trim());
      const keywords: string[] = [];
      
      for (const line of lines) {
        // 대괄호나 따옴표 제거
        const cleaned = line.replace(/[\[\]'"]/g, '').trim();
        if (cleaned && cleaned.length > 0 && cleaned.length < 20) {
          keywords.push(cleaned);
        }
      }
      
      return keywords.slice(0, 5);
    }
    
    return [];
  } catch (error) {
    console.error('Keyword extraction error:', error);
    // 에러 시 폴백 함수 사용
    return extractKeywordsFallback(text);
  }
}

// 폴백: 간단한 키워드 추출 (의미 없는 텍스트는 빈 배열 반환)
function extractKeywordsFallback(text: string): string[] {
  // 의미 없는 텍스트 체크
  if (!isMeaningfulText(text)) {
    return [];
  }
  
  const lowerText = text.toLowerCase();
  
  // 일상적인 표현이 있으면 일상/사담 태그 반환
  const casualExpressions = ['ㅋ', 'ㅎ', '하하', '헤헤', '오늘', '어제', '그냥', '그래', '맞아', '좋아', '재밌', '즐거', '힘들', '피곤', '졸려'];
  const hasCasualContent = casualExpressions.some(expr => lowerText.includes(expr));
  
  if (hasCasualContent || text.length < 20) {
    return ['일상', '사담'];
  }
  
  // 기술/비즈니스 키워드가 명확히 언급된 경우만 추출
  const techKeywords = ['ai', '인공지능', '데이터', '분석', '개발', '프로그래밍', '코딩', '알고리즘', '머신러닝', '딥러닝'];
  const businessKeywords = ['창업', '스타트업', '비즈니스', '사업', '투자', '펀딩', '벤처'];
  
  const keywords: string[] = [];
  
  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword === 'ai' ? 'AI' : keyword);
      break; // 하나만 추출
    }
  }
  
  for (const keyword of businessKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword);
      break; // 하나만 추출
    }
  }
  
  // 키워드가 없으면 일상/사담 반환
  return keywords.length > 0 ? keywords : ['일상', '사담'];
}

// 관심사 매칭률 계산
export function calculateInterestMatch(
  postTags: string[],
  userInterests: string[]
): number {
  if (userInterests.length === 0 || postTags.length === 0) {
    return 0;
  }

  let matchCount = 0;
  
  for (const tag of postTags) {
    const normalizedTag = tag.toLowerCase().trim();
    for (const interest of userInterests) {
      const normalizedInterest = interest.toLowerCase().trim();
      if (
        normalizedTag === normalizedInterest ||
        normalizedTag.includes(normalizedInterest) ||
        normalizedInterest.includes(normalizedTag)
      ) {
        matchCount++;
        break;
      }
    }
  }

  // 매칭률 = (매칭된 태그 수 / 전체 태그 수) * 100
  const matchRate = Math.round((matchCount / postTags.length) * 100);
  return Math.min(matchRate, 100);
}

// 태그별 노출 횟수와 상위 도메인 계산
export interface ExposureInfo {
  totalCount: number;
  topDomains: Array<{ domain: string; count: number }>;
}

// 노출 횟수 계산 (해당 태그를 관심사로 가진 사용자 수)
export async function calculateExposureCount(
  postTags: string[],
  postType: string
): Promise<ExposureInfo> {
  try {
    if (postTags.length === 0) {
      return { totalCount: 0, topDomains: [] };
    }

    // 모든 사용자 프로필 가져오기
    const allProfiles = await prisma.userProfile.findMany({
      select: {
        userId: true,
        interests: true,
      }
    });

    console.log(`[노출 계산] 게시물 태그: ${postTags.join(', ')}`);
    console.log(`[노출 계산] 전체 프로필 수: ${allProfiles.length}`);

    // 각 태그별로 노출 횟수 계산
    const tagExposures: Map<string, number> = new Map();
    
    for (const tag of postTags) {
      const matchingUsers = allProfiles.filter((profile: any) => {
        const interests = Array.isArray(profile.interests) ? profile.interests : [];
        return interests.some((interest: string) => {
          const tagLower = tag.toLowerCase().trim();
          const interestLower = interest.toLowerCase().trim();
          return tagLower === interestLower || 
                 interestLower.includes(tagLower) || 
                 tagLower.includes(interestLower);
        });
      });
      
      const baseCount = matchingUsers.length;
      const multiplier = postType === 'networking' ? 1.5 : 1;
      const count = Math.round(baseCount * multiplier);
      tagExposures.set(tag, Math.max(count, 0));
    }

    // 상위 도메인 정렬 (노출 횟수가 많은 순)
    const topDomains = Array.from(tagExposures.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // 상위 3개만
      .filter(item => item.count > 0); // 노출이 있는 것만

    // 전체 노출 횟수 (중복 제거된 사용자 수)
    const allMatchingUsers = new Set<string>();
    for (const tag of postTags) {
      allProfiles.forEach((profile: any) => {
        const interests = Array.isArray(profile.interests) ? profile.interests : [];
        const matches = interests.some((interest: string) => {
          const tagLower = tag.toLowerCase().trim();
          const interestLower = interest.toLowerCase().trim();
          return tagLower === interestLower || 
                 interestLower.includes(tagLower) || 
                 tagLower.includes(interestLower);
        });
        if (matches) {
          allMatchingUsers.add(profile.userId);
        }
      });
    }

    const totalCount = Math.round(allMatchingUsers.size * (postType === 'networking' ? 1.5 : 1));
    
    console.log(`[노출 계산] 전체 노출: ${totalCount}, 상위 도메인:`, topDomains);
    
    return {
      totalCount: Math.max(totalCount, 0),
      topDomains: topDomains.length > 0 ? topDomains : []
    };
  } catch (error) {
    console.error('Exposure count calculation error:', error);
    // 에러 시 기본값 반환
    return {
      totalCount: postTags.length * 15,
      topDomains: postTags.slice(0, 2).map(tag => ({ domain: tag, count: 15 }))
    };
  }
}

