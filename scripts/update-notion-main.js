import 'dotenv/config';
import fetch from 'node-fetch';

/**
 * @description Notion 'Babble' 메인 페이지 상단에 프로젝트 소개 및 브랜딩 내용을 업데이트합니다.
 */

async function updateNotionMain() {
  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_PAGE_ID;

  if (!token || !pageId) {
    console.error('❌ Error: NOTION_TOKEN or NOTION_PAGE_ID not found in .env');
    return;
  }

  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;

  // 메인 페이지 상단에 추가될 블록들
  const children = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: '💬 Babble (Project DUXX)' } }]
      }
    },
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: '지도를 통해 소통하고 가상 인격(AI)과 함께 살아 움직이는 로컬 커뮤니티를 경험하세요.' } }],
        icon: { type: 'emoji', emoji: '📍' },
        color: 'blue_background'
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '🌟 Project Vision & Identity' } }]
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: 'Babble' }, annotations: { bold: true, color: 'blue' } },
          { type: 'text', text: { content: '은 단순한 지도 서비스를 넘어, 특정 장소에서 발생하는 다양한 이야기와 감정을 버블(Bubble) 형태로 시각화하는 ' } },
          { type: 'text', text: { content: '인터랙티브 로컬 커뮤니케이션 플랫폼' }, annotations: { bold: true } },
          { type: 'text', text: { content: '입니다.' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{ type: 'text', text: { content: '"공간에 가치를 입히고, 인격(Persona)을 부여하다."' } }]
      }
    },
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: '🎨 Branding Key Concepts' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Dynamic Motion: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: 'Framer Motion을 활용한 부드러운 전환과 클릭 시 발생하는 Burst 효과로 생동감 넘치는 UX 구현' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'AI Persona: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: '[지역명] [인격] [이모지] 조합의 지능형 페르소나들이 공간의 맥락에 맞는 깊이 있는 답변 제공' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Clean UI/UX: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: 'Tailwind CSS 기반의 테마 시스템과 모바일 웹 뷰에 최적화된 인터페이스 유지' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: '🛠 Technology Stack' } }]
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'React(Vite) | Supabase | Google & Kakao Maps API | Framer Motion | Tailwind CSS' } }]
      }
    },
    {
      object: 'block',
      type: 'divider',
      divider: {}
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '📅 Update Logs' } }]
      }
    }
  ];

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({ children })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success: Notion main page description updated!');
    } else {
      console.error('❌ Error updating Notion main page:', data.message || data);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

updateNotionMain();
