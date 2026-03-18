import 'dotenv/config';
import fetch from 'node-fetch';

/**
 * @description 어제(2026-03-17/18)의 수정 사항들을 노션 'Babble' 페이지로 업로드하는 동기화 스크립트입니다.
 */

async function syncToNotion() {
  const token = process.env.NOTION_TOKEN;
  const parentPageId = process.env.NOTION_PAGE_ID;

  if (!token || !parentPageId) {
    console.error('❌ Error: NOTION_TOKEN or NOTION_PAGE_ID not found in .env');
    return;
  }

  // 오늘 날짜 및 버전 정보 생성
  const today = new Date().toISOString().split('T')[0];
  const version = "v34.4"; 
  const pageTitle = `Update Log: ${today} (${version})`;

  const url = `https://api.notion.com/v1/pages`;

  const requestBody = {
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: pageTitle } }]
      }
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: `📝 ${today} 수정 사함 리스트` } }]
        }
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: '1. 애니메이션 및 모션' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'framer-motion, canvas-confetti 라이브러리 설치' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '버블 선택 시 외곽선 제거 및 글로우(Glow) 효과 레이어 추가' } }]
        }
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: '2. AI 및 인터랙션 기능' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '가상 인격 AI(aiPersonas.js) 도입 및 답글 연동' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '답글 삭제 기능(X 버튼) 추가' } }]
        }
      },
      {
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: '3. UI/UX 및 모바일 최적화' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '사이드바 중복 스크롤 제거 및 입력창 하단 즉시 배치' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '모바일 웹 뷰 포커스 시 자동 줌(Auto-zoom) 현상 차단' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: '사이드바 외부 영역 클릭 시 전체 닫기(Close-all) 로직 구현' } }]
        }
      },
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: '📅 업로드 일시: ' }, annotations: { italic: true } },
            { type: 'text', text: { content: new Date().toLocaleString('ko-KR') }, annotations: { bold: true, color: 'blue' } }
          ]
        }
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success: New sub-page created! [${pageTitle}]`);
    } else {
      console.error('❌ Error creating Notion sub-page:', data.message || data);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

syncToNotion();
