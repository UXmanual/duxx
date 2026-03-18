import 'dotenv/config';
import fetch from 'node-fetch';

/**
 * @description 노션 'Babble' 메인 페이지를 상세 브랜딩 기획안 내용으로 고도화하여 업데이트합니다.
 */

async function updateNotionBranding() {
  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_PAGE_ID;

  if (!token || !pageId) {
    console.error('❌ Error: NOTION_TOKEN or NOTION_PAGE_ID not found in .env');
    return;
  }

  // 기존 블록들을 덮어쓰기 위해 먼저 내용을 비우거나 순차적으로 배치하는 전략을 취할 수 있으나, 
  // 여기서는 가장 아름다운 구성을 위해 전체 블록 구조를 새로 정의하여 전달합니다.
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;

  const children = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: '💬 Babble : 지도로 보는 동네 이야기' } }]
      }
    },
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: '지도를 "바블바블"하게 채워가는 우리 동네 실시간 인터랙션 플랫폼' } }],
        icon: { type: 'emoji', emoji: '📢' },
        color: 'blue_background'
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '1️⃣ Naming Strategy' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Main Brand: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: 'Babble (심플함과 전문성을 강조한 공식 명칭)' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Service Wit: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: '"바블바블" - 와글와글 소통하는 생동감을 표현하는 부사적 활용' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '2️⃣ Brand Identity (3L)' } }]
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: '슬로건: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: '"지도로 보는 동네 이야기, 바블(Babble)"' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Light: ' }, annotations: { bold: true, color: 'blue' } },
          { type: 'text', text: { content: '가입 없이 가볍게 시작하는 소통' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Local: ' }, annotations: { bold: true, color: 'green' } },
          { type: 'text', text: { content: '내 주변 이슈를 가장 빠르게 포착' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Lively: ' }, annotations: { bold: true, color: 'orange' } },
          { type: 'text', text: { content: '지도 위에서 생동감 있게 움직이는 목소리' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '3️⃣ Visual System & UI' } }]
      }
    },
    {
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{ type: 'text', text: { content: 'Color Palette: Deep Navy & Bubble Mint Combination' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Main (#1A237E): ' }, annotations: { color: 'blue' } },
          { type: 'text', text: { content: '지도의 베이스와 텍스트의 신뢰감' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: 'Point (#00E5FF): ' }, annotations: { color: 'gray' } },
          { type: 'text', text: { content: '활기찬 웅성거림을 강조하는 민트색 말풍선 마커' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ type: 'text', text: { content: '📍 Interaction Core' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: '입체감 있는 "말풍선" 모양의 커스텀 마커 사용' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: '실시간 "웅성거림" 카운트 표시 및 클릭 시 통 튀어오르는 모션 연출' } }]
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '4️⃣ User Experience : 익명 계정 규칙' } }]
      }
    },
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [{ type: 'text', text: { content: '[동네 명칭] + [바블러 성격] + 바블\n(예: 삼성동 잠자는 바블, 역삼동 배고픈 바블)' } }],
        icon: { type: 'emoji', emoji: '👤' },
        color: 'gray_background'
      }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: '사용자가 접속할 때마다 랜덤하게 배정되는 인격으로 소소한 즐거움과 익명성을 동시에 제공합니다.' } }]
      }
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '5️⃣ Edge Features (바블만의 강점)' } }]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: '바블 핫스팟 (Babble Hotspot): ' }, annotations: { bold: true } },
          { type: 'text', text: { content: '활발한 지역에 시각적 효과와 반짝임을 주어 사람들을 유도' } }
        ]
      }
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          { type: 'text', text: { content: '바블코드 (Babble Code): ' }, annotations: { bold: true } },
          { type: 'text', text: { content: '이메일 없는 익명 복구 시스템 (BBL-2026-XXXX)' } }
        ]
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
        rich_text: [{ type: 'text', text: { content: '📅 Update History' } }]
      }
    }
  ];

  try {
    // 먼저 기존 메인 페이지의 내용을 모두 지우고 새 구조를 넣는 것은 위험할 수 있으므로, 
    // 여기서는 기존 블록 아래에 덧붙이는 것이 아니라 새로운 가이드 섹션으로 업데이트합니다.
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
      console.log('✅ Success: Detailed branding guide uploaded to Notion main page!');
    } else {
      console.error('❌ Error updating Notion branding:', data.message || data);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

updateNotionBranding();
