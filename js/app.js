/* ================================================================
   가상 스마트폰 구경하기  (단일 파일 / 서버·DB 없음)
  ----------------------------------------------------------------
   ★ 사진·배경화면·이름·대화·게시물 등 모든 데이터는
     아래 <script> 맨 위쪽의 "CONFIG" 영역에 모여 있습니다.
     "★ 교체 가능" 으로 검색하면 수정할 수 있는 부분이 모두 나옵니다.
   ★ 지금 들어간 이미지는 picsum.photos / pravatar.cc 의 임의 이미지입니다.
     내 사진을 쓰려면 경로만 바꾸세요.  예)  './images/photo1.jpg'
   ★ 새로고침하면 항상 잠금화면에서 시작합니다. (저장 기능 없음)
  ================================================================*/

(() => {
'use strict';

/* ================================================================
   1. 유틸
   ================================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h  = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad = n => String(n).padStart(2, '0');
const fmt = n => n >= 10000 ? (n/10000).toFixed(1).replace(/\.0$/,'') + '만' : n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + '천' : String(n);
const fmtc = n => n.toLocaleString('ko-KR');
const mmss = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s/60) + ':' + pad(s % 60); };
const clockStr = d => (d.getHours() < 12 ? '오전 ' : '오후 ') + (d.getHours() % 12 || 12) + ':' + pad(d.getMinutes());
const dateStr = d => `${d.getMonth()+1}월 ${d.getDate()}일`;
const DOW = '일월화수목금토';
const daysAgo = (n, hr = 12, mi = 0) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hr, mi, 0, 0); return d; };
const EASE = 'cubic-bezier(.32,.72,0,1)';

// 이미지 로드 시 페이드인 / 실패 시 숨김(뒤의 배경색·이니셜이 보임)
document.addEventListener('load',  e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('err'); }, true);

const hue = s => { let n = 0; for (const c of s) n = (n * 31 + c.charCodeAt(0)) % 360; return `linear-gradient(135deg,hsl(${n} 70% 62%),hsl(${(n+40)%360} 70% 52%))`; };
// 아바타: 이미지가 없거나 실패하면 이름 첫 글자가 보입니다
const av = (u, cls = '') => `<span class="av ${cls}" style="background:${hue(u.name)}"><b>${esc([...u.name][0] || '?')}</b>${u.avatar ? `<img class="px" src="${u.avatar}" alt="" loading="lazy">` : ''}</span>`;

/* ================================================================
   2. ★ CONFIG — 여기만 고치면 내용이 바뀝니다 ★
   ----------------------------------------------------------------
   이미지 주소를 쓰는 곳은 모두 IMG(...) / AVATAR(...) 로 되어 있습니다.
   내 사진을 쓰려면 문자열 경로로 바꾸세요.   예)  './img/me.jpg'
   ================================================================ */

// ★ 교체 가능: 임의 풍경 이미지 생성기 (seed가 같으면 항상 같은 사진). 내 사진 폴더 쓰려면 이 함수를 바꾸거나, 각 항목에 직접 경로 입력
const IMG = (seed, w = 800, h = 800) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
// ★ 교체 가능: 임의 인물 프로필 이미지 (1~70). 실패하면 이름 첫 글자로 표시됨
const AVATAR = n => `https://i.pravatar.cc/200?img=${n}`;

const CONFIG = {

  /* ---- 폰 주인 정보 ---- */
  owner: {
    name: '하린',
    handle: 'harin.daily',
    avatar: AVATAR(47),                       // ★ 교체 가능: 주인 프로필 사진
    bio: '기록하는 사람 ✦ 서울\n커피 · 필름 · 산책',
  },

  /* ---- 배경화면 ---- */
  wallpaper: {
    lock: '',   // ★ 교체 가능: 잠금화면 배경
    home: './images/homescreen.jpg',   // ★ 교체 가능: 홈화면 배경
  },
  widgetPhoto: { src: IMG('widget-memory', 600, 600), caption: '1년 전 오늘' },  // ★ 교체 가능: 홈화면 '추억' 위젯 사진
  widgetEvent: { time: '오후 6:30', title: '성수 저녁 약속' },                    // 홈화면 캘린더 위젯 일정

  /* ---- 홈 화면 앱 (라벨 / 배지 숫자 / iconImage 에 이미지 경로를 넣으면 아이콘이 그 이미지로 바뀜) ---- */
  //CONFIG.apps
  apps: {
    gallery:   { label: '갤러리',    badge: 0, iconImage: '' },   // ★ 교체 가능: iconImage: './icons/gallery.png'
    instagram: { label: '인스타그램', badge: 5, iconImage: '' },
    x:         { label: 'X',         badge: 0, iconImage: '' },
    messages:  { label: '메시지',    badge: 0, iconImage: '' },   // 배지는 안 읽은 메시지 수로 자동 계산됨
    music:     { label: '음악',      badge: 0, iconImage: '' },
    notes:     { label: '메모',      badge: 0, iconImage: '' },
       // '앱' 아이콘 = 앱스토어 화면으로 구현
    phone:     { label: '전화',      iconImage: '' },            // 아래 4개는 독(Dock)에 있는 장식용 아이콘
    safari:    { label: 'Safari',    iconImage: '' },
    mail:      { label: '메일',      iconImage: '' },
    camera:    { label: '카메라',    iconImage: '' },
    calendar: { label: '캘린더', badge: 0, iconImage: '' },
    youtube:  { label: 'YouTube', badge: 0, iconImage: '' },
  },

  /* ---- 잠금화면 알림 (누르면 잠금 해제 후 해당 앱 실행) ----*/
  lockNotifs: [
    /*{ app: 'messages',  title: '민지',       body: '오늘 저녁 7시에 성수에서 볼까? 🍜',          time: '지금' },
    { app: 'instagram', title: '인스타그램', body: 'jun_films님이 회원님의 사진을 좋아합니다.',    time: '5분 전' },
    { app: 'music',     title: '음악',       body: '새 앨범 「Midnight Pier」가 보관함에 추가되었어요.', time: '1시간 전' },*/
  ],


  /* ---- 갤러리 ----  [seed, 제목, 장소, 가로, 세로]  seed 대신 내 사진을 쓰려면 아래 photos 를 직접 만들어도 됨 */
  gallery: {
    photos: [
      ['harbor','노을 지는 부두','부산 해운대',1200,900], ['latte','주말의 라떼','성수동',1000,1000],
      ['alley','골목 산책','익선동',1000,1300],          ['sunset','퇴근길 하늘','한강공원',1300,900],
      ['books','서점에서 득템','연남동',1000,1250],       ['cat','동네 고양이','망원동',1000,1000],
      ['ramen','야식 라멘','홍대',1200,900],             ['mountain','첫눈 온 산','북한산',1300,870],
      ['subway','지하철 창가','2호선',1000,1300],         ['market','시장 구경','광장시장',1200,900],
      ['rain','비 오는 날','종로',1000,1250],            ['museum','전시 보러 가는 길','국립현대미술관',1000,1000],
      ['cafe','작업하기 좋은 카페','합정',1200,900],       ['flowers','꽃시장','고속터미널',1000,1250],
      ['train','KTX 창밖','대전',1300,870],              ['beach','겨울 바다','강릉',1300,900],
      ['window','창가 햇살','우리 집',1000,1300],          ['bike','자전거 타기','반포',1200,900],
      ['night','네온 거리','을지로',1000,1250],           ['snow','눈 내린 아침','서울숲',1000,1000],
      ['tea','따뜻한 차 한 잔','삼청동',1000,1000],        ['street','횡단보도','강남',1300,870],
      ['forest','숲길','남산',1000,1300],                ['bridge','다리 위에서','반포대교',1300,900],
    ].map(([seed, title, place, w, hh], i) => ({ seed, title, place, w, h: hh, date: daysAgo(i * 2 + 1, 9 + (i * 5) % 12, (i * 7) % 60) })),
    // 앨범: idx = 위 photos 의 순번(0부터)
    albums: [
      { name: '최근 항목', idx: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
      { name: '즐겨찾기',  idx: [0,3,7,12,15,19,23] },
      { name: '여행',      idx: [0,7,14,15,17,23,22] },
      { name: '음식',      idx: [1,6,9,12,20] },
      { name: '풍경',      idx: [0,3,7,15,19,22,23] },
      { name: '도시',      idx: [2,8,10,18,21] },
    ],
    favorites: [0, 3, 7],
  },

  /* ---- 인스타그램 ---- */
  instagram: {
    stories: [   // ★ 교체 가능: 스토리 (name / avatar / img)
      { name: '내 스토리', me: true, avatar: AVATAR(47), img: IMG('story-me', 700, 1200) },
      { name: 'minji_',      avatar: AVATAR(5),  img: IMG('story-1', 700, 1200) },
      { name: 'jun_films',   avatar: AVATAR(12), img: IMG('story-2', 700, 1200) },
      { name: 'soyeon.k',    avatar: AVATAR(9),  img: IMG('story-3', 700, 1200) },
      { name: 'daehan_run',  avatar: AVATAR(33), img: IMG('story-4', 700, 1200) },
      { name: 'yuna.draws',  avatar: AVATAR(44), img: IMG('story-5', 700, 1200) },
      { name: 'cafe.mood',   avatar: AVATAR(25), img: IMG('story-6', 700, 1200) },
    ],
    posts: [     // ★ 교체 가능: 게시물 (images 는 여러 장이면 가로로 넘길 수 있음)
      { user: 'minji_', name: '민지', avatar: AVATAR(5), place: '성수동', images: [IMG('ig-a1',900,1125), IMG('ig-a2',900,1125), IMG('ig-a3',900,1125)],
        likes: 1284, caption: '오늘의 성수 산책 🌿 햇살이 너무 좋았던 일요일', time: '2시간 전',
        comments: [{u:'jun_films',t:'사진 색감 미쳤다 ㅠㅠ'},{u:'soyeon.k',t:'다음엔 같이 가요!! 🙌'},{u:'cafe.mood',t:'여기 어디예요? 가보고 싶어요'}], commentCount: 48 },
      { user: 'jun_films', name: '준호', avatar: AVATAR(12), place: '서울숲', images: [IMG('ig-b1',900,1125)],
        likes: 932, caption: '필름 한 롤 끝. 노을이 예뻤던 날 🎞️', time: '4시간 전',
        comments: [{u:'minji_',t:'역시 준호 오빠 감성…'},{u:'harin.daily',t:'이거 보정 어떻게 했어요?'}], commentCount: 27 },
      { user: 'harin.daily', name: '하린', avatar: AVATAR(47), place: '합정', images: [IMG('cafe',900,1125), IMG('latte',900,1125)],
        likes: 356, caption: '작업하기 좋은 카페 발견 ☕ 오늘은 여기서 끝장내기', time: '어제',
        comments: [{u:'minji_',t:'나도 데려가줘!'},{u:'yuna.draws',t:'분위기 최고 ✨'}], commentCount: 12 },
      { user: 'daehan_run', name: '대한', avatar: AVATAR(33), place: '반포한강공원', images: [IMG('ig-d1',900,1125), IMG('ig-d2',900,1125)],
        likes: 2410, caption: '10km 완주! 한 달 전의 나야 고마워 🏃‍♂️💨 #러닝 #기록', time: '어제',
        comments: [{u:'soyeon.k',t:'대박 👏👏'}], commentCount: 91 },
      { user: 'yuna.draws', name: '유나', avatar: AVATAR(44), place: '', images: [IMG('ig-e1',900,1125)],
        likes: 4120, caption: '이번 주 드로잉 연습 🎨 마음에 드는 색 조합을 찾았다!', time: '2일 전',
        comments: [{u:'minji_',t:'미쳤다 진짜…'},{u:'jun_films',t:'전시회 해야 함'}], commentCount: 203 },
      { user: 'soyeon.k', name: '소영', avatar: AVATAR(9), place: '제주', images: [IMG('ig-f1',900,1125), IMG('ig-f2',900,1125), IMG('ig-f3',900,1125)],
        likes: 786, caption: '제주 3박 4일 요약 🍊 다시 가고 싶다', time: '3일 전',
        comments: [{u:'harin.daily',t:'부럽다…!!'}], commentCount: 34 },
    ],
    exploreSeeds: ['ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10','ex11','ex12','ex13','ex14','ex15','ex16','ex17','ex18'],  // ★ 교체 가능: 탐색 탭 이미지
    highlights: [{ n: '여행', seed: 'hl1' }, { n: '맛집', seed: 'hl2' }, { n: '일상', seed: 'hl3' }, { n: '책', seed: 'hl4' }],
  },

  /* ---- X (트위터) ---- */
  x: {
    tweets: [    // ★ 교체 가능: 트윗 (img 가 있으면 사진 첨부)
      { name: '소영', handle: 'soyeon_k', avatar: AVATAR(9), time: '3시간', text: '월요일 아침 출근길... 커피 없이는 못 버티겠다 ☕ #월요병', replies: 24, rts: 12, likes: 358, views: 12400 },
      { name: '테크브리프', handle: 'techbrief_kr', avatar: AVATAR(60), verified: true, time: '5시간', text: '오늘의 IT 이슈 3줄 요약\n1) 새로운 폴더블 기기 출시 일정 공개\n2) 오픈소스 AI 모델 경쟁 가속\n3) 배터리 효율 개선 칩 발표', replies: 88, rts: 421, likes: 2104, views: 98300 },
      { name: '하린', handle: 'harin.daily', avatar: AVATAR(47), time: '7시간', text: '오늘 찍은 사진 중에 제일 마음에 드는 한 장 📷\n#성수 #일상', img: IMG('x-harin', 900, 560), replies: 6, rts: 3, likes: 142, views: 3200 },
      { name: '대한', handle: 'daehan_run', avatar: AVATAR(33), time: '9시간', text: '새벽 러닝 완료. 한강에 안개 낀 거 처음 봄. 진짜 영화 같았다 🌫️', img: IMG('x-fog', 900, 560), replies: 15, rts: 9, likes: 521, views: 7800 },
      { name: '북로그', handle: 'booklog_', avatar: AVATAR(20), verified: true, time: '12시간', text: '이번 달 읽을 책 리스트 정리했어요. 같이 읽으실 분? 📚 #독서모임', replies: 41, rts: 66, likes: 874, views: 21000 },
      { name: '준호', handle: 'jun_films', avatar: AVATAR(12), time: '어제', text: '필름 현상 맡기고 기다리는 시간이 제일 설렌다. 디지털은 절대 못 주는 감정.', replies: 9, rts: 5, likes: 267, views: 4100 },
      { name: '유나', handle: 'yuna_draws', avatar: AVATAR(44), time: '어제', text: '드로잉 팁: 그림이 막힐 땐 색부터 정하지 말고 그림자 모양부터 잡아보세요 🎨', replies: 33, rts: 120, likes: 1930, views: 40500 },
      { name: '민지', handle: 'minji_222', avatar: AVATAR(5), time: '2일', text: '오늘 점심 메뉴 추천 좀... 회사 앞 식당 다 돌려먹음 😭', replies: 52, rts: 4, likes: 98, views: 2300 },
      { name: '날씨알리미', handle: 'weather_now', avatar: AVATAR(68), verified: true, time: '2일', text: '내일 아침 기온 뚝↓ 두꺼운 외투 챙기세요. 출근길 쌀쌀합니다.', replies: 7, rts: 210, likes: 640, views: 33000 },
    ],
  },

  /* ---- 메시지 ----  me:true = 내가 보낸 메시지,  replies = 내가 답장하면 상대가 돌려줄 말들 */
  messages: [
    { id: 'minji', name: '민지', avatar: AVATAR(5), unread: 2, time: '오후 3:21', replies: ['ㅋㅋㅋㅋ 인정', '그럼 7시에 성수역 3번 출구에서 보자!', '아 맞다 사진 보내줘~', '좋아좋아 👍'],
      msgs: [ {t:'하린아 오늘 뭐해?'}, {me:1,t:'작업 좀 하다가 저녁쯤 끝날 듯'}, {t:'그럼 저녁 같이 먹자!'}, {t:'오늘 저녁 7시에 성수에서 볼까? 🍜'} ] },
    { id: 'mom', name: '엄마', avatar: AVATAR(31), unread: 0, time: '오전 11:02', replies: ['밥 잘 챙겨먹고~', '주말에 집에 올 거지?', '추운데 옷 따뜻하게 입어라'],
      msgs: [ {t:'우리 딸 밥은 먹었니?'}, {me:1,t:'응 엄마! 방금 먹었어'}, {t:'그래 다행이다. 요즘 날씨 추우니까 따뜻하게 입고 다녀'}, {me:1,t:'알겠어요~ 걱정 마세요 😊'} ] },
    { id: 'jun', name: '준호', avatar: AVATAR(12), unread: 0, time: '어제', replies: ['오 그거 좋다', '내가 현상해서 줄게', '다음 주에 같이 찍으러 가자'],
      msgs: [ {t:'지난번에 찍은 필름 나왔어'}, {t:'', img: IMG('chat-film', 600, 800)}, {me:1,t:'와 색감 진짜 좋다!!'}, {me:1,t:'나도 한 장 줄 수 있어?'} ] },
    { id: 'team', name: '스터디 모임 (5)', avatar: IMG('group-study', 200, 200), unread: 0, time: '어제', replies: ['넵 확인했습니다!', '저도 참석할게요 🙋', '자료는 노션에 올려둘게요'],
      msgs: [ {t:'이번 주 스터디는 목요일 저녁 8시입니다.'}, {me:1,t:'참석 가능해요!'}, {t:'발표 자료 미리 공유 부탁드려요 🙏'} ] },
    { id: 'delivery', name: '택배알림', avatar: '', unread: 0, time: '월요일', replies: ['(자동 응답 불가 번호입니다)'],
      msgs: [ {t:'[택배] 고객님의 상품이 오늘 오후 배송 예정입니다. 문 앞에 놓아드릴게요.'} ] },
    { id: 'sis', name: '소영', avatar: AVATAR(9), unread: 0, time: '일요일', replies: ['ㅋㅋㅋ 아니야', '주말에 놀러 갈게~', '그 카페 어디라고?'],
      msgs: [ {t:'언니 그 카페 이름 뭐였지?'}, {me:1,t:'합정에 있는 거? 사진 보내줄게'}, {t:'오 고마워 ㅎㅎ'} ] },
  ],

  /* ---- 음악 ----  audio 칸에 mp3 경로를 넣으면 실제로 재생됩니다 (비워두면 재생 시뮬레이션) ---- */
  songs: [
    { title: 'Midnight Pier',        artist: 'Luna Hart',        dur: 222, cover: IMG('album-1', 600, 600), audio: '' },  // ★ 교체 가능: cover / audio
    { title: 'Paper Planes at Dawn', artist: 'The Quiet Hours',  dur: 198, cover: IMG('album-2', 600, 600), audio: '' },
    { title: '한강의 밤',             artist: '소담',             dur: 245, cover: IMG('album-3', 600, 600), audio: '' },
    { title: 'Neon Letters',         artist: 'Aiden Rowe',       dur: 178, cover: IMG('album-4', 600, 600), audio: '' },
    { title: '여름의 끝에서',          artist: '하늘빛',           dur: 211, cover: IMG('album-5', 600, 600), audio: '' },
    { title: 'Slow Motion Love',     artist: 'Mira & The Tides', dur: 229, cover: IMG('album-6', 600, 600), audio: '' },
    { title: 'Coffee Stain',         artist: 'Oliver Bloom',     dur: 164, cover: IMG('album-7', 600, 600), audio: '' },
    { title: 'Orbit',                artist: 'Sera',             dur: 252, cover: IMG('album-8', 600, 600), audio: '' },
  ],
  musicFeature: { tag: '오늘의 추천', title: '비 오는 오후를 위한 플레이리스트', sub: '하린을 위한 믹스', cover: IMG('mix-feature', 900, 600) },  // ★ 교체 가능

  /* ---- 메모 ----  days = 며칠 전, check = 체크리스트 메모, thumb = 목록 오른쪽 썸네일 ---- */
  notes: [
    { title: '장보기 리스트', pinned: true, days: 0, check: [ {t:'우유',d:true}, {t:'달걀',d:true}, {t:'방울토마토',d:false}, {t:'식빵',d:false}, {t:'원두 200g',d:false} ] },
    { title: '11월 계획', pinned: true, days: 0, body: '• 포트폴리오 정리\n• 사진 전시 보러 가기\n• 엄마 생신 선물 고르기\n• 제주 여행 항공권 알아보기\n\n이번 달은 무리하지 말고 천천히, 꾸준히.' },
    { title: '제주 여행 아이디어', days: 1, thumb: IMG('note-jeju', 200, 200), body: '1일차: 공항 → 협재 → 숙소\n2일차: 오름 일출 → 카페 투어\n3일차: 우도 자전거\n\n맛집: 흑돼지, 고등어회, 한치 물회\n렌터카는 미리 예약하기!' },
    { title: '독서 메모 — 에세이', days: 3, body: '"천천히 걷는 사람이 더 멀리 본다"\n\n오늘 읽은 부분에서 가장 좋았던 문장. 속도보다 방향이라는 말이 계속 남는다.' },
    { title: '레시피: 간장계란밥', days: 5, thumb: IMG('note-egg', 200, 200), body: '1. 밥 한 공기\n2. 달걀 2개 반숙 프라이\n3. 간장 1T + 참기름 1t\n4. 김가루, 깨 솔솔\n\n비벼서 먹으면 끝! 야식 최고.' },
    { title: '오늘 하루', days: 12, body: '아침엔 흐렸는데 오후에 해가 났다. 퇴근길에 산책하면서 들은 노래가 너무 좋았다. 이런 날이 계속되면 좋겠다.' },
  ],

};

/* ================================================================
   3. 아이콘 (SVG)
   ================================================================ */
const S = (p, x = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${x}>${p}</svg>`;
const HEART = '<path d="M12 20.5s-8.5-5.3-8.5-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.7C20.5 15.2 12 20.5 12 20.5z"/>';
const I = {
  chev:  S('<path d="m15 5-7 7 7 7"/>', 'stroke-width="2.4"'),
  chevR: S('<path d="m9 5 7 7-7 7"/>'),
  heart: S(HEART), heartF: S(HEART, 'fill="currentColor"'),
  comment: S('<path d="M20.5 12a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.2-4.4A8.5 8.5 0 1 1 20.5 12z"/>'),
  send: S('<path d="M21 3 3 10.5l7 3 3 7z"/><path d="m21 3-10 10.5"/>'),
  bookmark: S('<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/>'), bookmarkF: S('<path d="M6.5 3.5h11v17L12 16.5l-5.5 4z"/>', 'fill="currentColor"'),
  more: S('<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  plusSq: S('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>'),
  home: S('<path d="M4 11.5 12 4.5l8 7V20H4z"/>'),
  search: S('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  user: S('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.8-5.5 7.5-5.5s6.700 1.700 7.500 5.500"/>'),
  reels: S('<rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="M3.5 9h17M9 4l3 5M15 4l3 5M10.500 12.500l4 2.500-4 2.500z"/>'),
  bell: S('<path d="M6 17v-6a6 6 0 0 1 12 0v6l1.500 2h-15z"/><path d="M10 21.500h4"/>'),
  mail: S('<rect x="3.500" y="5.500" width="17" height="13" rx="2.500"/><path d="m4 7 8 6 8-6"/>'),
  photo: S('<rect x="3.500" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.500"/><path d="m4 17 5-4.500 4 3.500 3-2.500 4 3"/>'),
  star: S('<path d="m12 3.500 2.500 5.300 5.800.7-4.300 4 1.100 5.700L12 16.400l-5.100 2.800L8 13.500l-4.300-4 5.800-.7z"/>'),
  albums: S('<rect x="3.500" y="7" width="17" height="13" rx="3"/><path d="M6.500 3.500h11"/>'),
  play: S('<path d="M7 4.500v15l13-7.500z"/>', 'fill="currentColor" stroke-width="1"'),
  pause: S('<rect x="6" y="5" width="4.200" height="14" rx="1.200"/><rect x="13.800" y="5" width="4.200" height="14" rx="1.200"/>', 'fill="currentColor" stroke="none"'),
  next: S('<path d="M5 5.500v13l9-6.500zM15.500 5.500v13h3v-13z"/>', 'fill="currentColor" stroke="none"'),
  prev: S('<path d="M19 5.500v13l-9-6.500zM8.500 5.500v13h-3v-13z"/>', 'fill="currentColor" stroke="none"'),
  volL: S('<path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" fill="currentColor"/>'),
  volH: S('<path d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z" fill="currentColor"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a7.500 7.500 0 0 1 0 11"/>'),
  quote: S('<path d="M5 6h14a1.500 1.500 0 0 1 1.500 1.500V15A1.500 1.500 0 0 1 19 16.500h-6.500L8 20.500v-4H5A1.500 1.500 0 0 1 3.500 15V7.500A1.500 1.500 0 0 1 5 6z"/>'),
  airplay: S('<path d="M7 17H5.500a2 2 0 0 1-2-2V6.500a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H17"/><path d="m12 14 5 6H7z" fill="currentColor"/>'),
  list: S('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  compose: S('<path d="M11 4.500H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4"/><path d="M18.500 3.500a2.100 2.100 0 0 1 3 3L12 16l-4 1 1-4z"/>'),
  share: S('<path d="M12 15V3.500M7.500 7.500 12 3l4.500 4.500"/><path d="M8 11H6.500a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16"/>'),
  trash: S('<path d="M4.500 7h15M9.500 7V4.500h5V7M6.500 7l1 13h9l1-13M10 11v6M14 11v6"/>'),
  info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.700v.1"/>'),
  repost: S('<path d="m17 3 3.500 3.500L17 10M4 11V9.500a3 3 0 0 1 3-3h13M7 21l-3.500-3.500L7 14M20 13v1.500a3 3 0 0 1-3 3H4"/>'),
  views: S('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
  close: S('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.2"'),
  check: S('<path d="m5 12.500 4.500 4.500L19 7.500"/>'),
  flash: S('<path d="M8 3h8v4l-1.500 2v10a1.500 1.500 0 0 1-1.500 1.500h-2A1.500 1.500 0 0 1 9.500 19V9L8 7z"/><path d="M12 11.500v3"/>'),
  camera: S('<path d="M4 8.500a2 2 0 0 1 2-2h2l1.500-2h5l1.500 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.500" r="3.500"/>'),
  lock: S('<rect x="5" y="11" width="14" height="9" rx="2.500"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  verified: '<svg class="vf" viewBox="0 0 24 24"><path d="M12 2.5l2.300 1.800 2.900-.2 1 2.700 2.500 1.500-.8 2.800.8 2.800-2.500 1.500-1 2.700-2.900-.2L12 21.500l-2.300-1.800-2.900.2-1-2.700-2.500-1.500.8-2.800-.8-2.800 2.500-1.500 1-2.700 2.900.2z"/><path d="m8.500 12 2.500 2.500 4.500-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

// 홈화면 앱 아이콘 (저작권 문제를 피하려고 일반적인 도형으로 그린 아이콘입니다. 실제 아이콘 이미지를 쓰려면 CONFIG.apps.*.iconImage 사용)
const GLYPH = {
  gallery:  `<svg viewBox="0 0 60 60"><rect x="10" y="15" width="32" height="26" rx="5" fill="#fff" opacity=".5" transform="rotate(-9 26 28)"/><rect x="17" y="19" width="33" height="26" rx="5" fill="#fff"/><circle cx="27" cy="28" r="3.2" fill="#2f7bff"/><path d="M19.5 43.5 29 34l6 6 5-5 9.500 8.500z" fill="#2f7bff" opacity=".9"/></svg>`,
  instagram:`<svg viewBox="0 0 60 60"><path d="M30 45C16 36 14 26 19 21c3.500-3.500 8.500-2.500 11 1.500 2.500-4 7.500-5 11-1.500 5 5 3 15-11 24z" fill="#fff"/></svg>`,
  x:        `<svg viewBox="0 0 60 60"><path d="M16 17h28a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H35l-8 8v-8H16a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5z" fill="#fff"/><g fill="#000"><rect x="18" y="24" width="24" height="3" rx="1.500"/><rect x="18" y="30" width="18" height="3" rx="1.500"/></g></svg>`,
  messages: `<svg viewBox="0 0 60 60"><path d="M30 13c-11.600 0-21 7.300-21 16.300 0 5.200 3.100 9.800 8 12.700-.3 2.700-1.800 5.300-3.800 7.200 4.200-.3 8-1.800 10.700-4 1.900.4 3.900.6 6.100.6 11.600 0 21-7.300 21-16.500S41.600 13 30 13z" fill="#fff"/></svg>`,
  music:    `<svg viewBox="0 0 60 60"><ellipse cx="23" cy="42" rx="7.500" ry="6" fill="#fff" transform="rotate(-15 23 42)"/><rect x="28.500" y="14" width="3.800" height="28" rx="1.600" fill="#fff"/><path d="M32 14c7 1 11 5 11 12-3.500-3.500-6.500-4.500-11-4.500z" fill="#fff"/></svg>`,
  notes:    `<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fffef6"/><rect width="60" height="21" fill="#ffd60a"/><g stroke="#d4d4d8" stroke-width="2" stroke-linecap="round"><path d="M12 31h36M12 39h36M12 47h24"/></g></svg>`,
 //appstore
  calendar: `<svg viewBox="0 0 60 60"><rect x="7" y="10" width="46" height="43" rx="9" fill="#fff"/><path d="M7 19h46" stroke="#ff3b30" stroke-width="9"/><path d="M19 6v10M41 6v10" stroke="#555" stroke-width="4" stroke-linecap="round"/><text x="30" y="43" text-anchor="middle" font-size="25" font-weight="700" fill="#ff3b30">3</text></svg>`,
  youtube: `<svg viewBox="0 0 60 60"><rect x="6" y="14" width="48" height="32" rx="10" fill="#fff"/><path d="M26 22v16l14-8z" fill="#ff0033"/></svg>`,
  phone:    `<svg viewBox="0 0 60 60"><path d="M21 15l5 1 2 7-4 3c2 5 5 8 9 10l3-4 7 2 1 5c-1 4-5 6-9 5-12-3-19-12-19-22 0-3 2-6 4-7z" fill="#fff"/></svg>`,
  safari:   `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="19" fill="#fff" stroke="#2d8bff" stroke-width="3"/><path d="M40 20l-5 15-15 5 5-15z" fill="#ff4d4d"/><path d="M20 40l5-15 15-5-5 15z" fill="#cfd8e8"/></svg>`,
  mail:     `<svg viewBox="0 0 60 60"><rect x="12" y="17" width="36" height="26" rx="5" fill="#fff"/><path d="M13.500 21.500 30 34l16.500-12.500" stroke="#2d8bff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  camera:   `<svg viewBox="0 0 60 60"><path d="M17 21h5l2-4h12l2 4h5a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V24a3 3 0 0 1 3-3z" fill="#2c2c2e"/><circle cx="30" cy="32" r="7.500" fill="#d1d1d6"/><circle cx="30" cy="32" r="4.800" fill="#2c2c2e"/></svg>`,
};
const appIcon = key => {
  const a = CONFIG.apps[key] || {};
  return a.iconImage ? `<div class="ic" style="background:url('${a.iconImage}') center/cover"></div>` : `<div class="ic ic-${key}">${GLYPH[key] || ''}</div>`;
};

/* ================================================================
   4. 코어: 화면 크기 / 상태 / 시간 / 토스트
   ================================================================ */
const screen = $('#screen'), wrap = $('#wrap'), phone = $('#phone');
const lock = $('#lock'), home = $('#home'), homeUi = $('#homeUi'), appLayer = $('#appLayer');
const island = $('#island'), homebar = $('#homebar'), toastEl = $('#toast'), off = $('#off'), edgeEl = $('#edge'), lockUi = $('#lockUi');
const state = { view: 'lock', app: null, anim: false, origin: null };
const appEls = {};
const getScale = () => screen.getBoundingClientRect().width / screen.offsetWidth;
const local = el => { const s = getScale(), a = el.getBoundingClientRect(), b = screen.getBoundingClientRect(); return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s }; };
const setTheme = t => { screen.dataset.t = t; };

// 반응형: 모바일은 꽉 찬 화면, PC는 화면에 맞춰 폰 프레임을 축소

// 반응형: PC와 모바일 모두 폰 프레임 유지
function fit() {
  const vw = innerWidth;
  const vh = innerHeight;

  // 전체 화면 모드 비활성화
  document.body.classList.remove('fullscreen');

  const OW = 414;
  const OH = 868;
  const noRemote = vh < 640;

  document.body.classList.toggle('no-remote', noRemote);

  // 모바일은 여백을 조금 더 확보
  const isMobile = vw <= 520;
  const sideGap = isMobile ? 28 : 24;
  const bottomGap = isMobile ? 100 : (noRemote ? 24 : 92);

  const s = Math.min(
    1,
    (vw - sideGap) / OW,
    (vh - bottomGap) / OH
  );

  wrap.style.width = OW * s + 'px';
  wrap.style.height = OH * s + 'px';
  phone.style.transform = `scale(${s})`;
}

addEventListener('resize', fit);
fit();

function tick() {
  const d = new Date(), t = `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;
  $('#sbTime').textContent = t; $('#lTime').textContent = t;
  $('#lDate').textContent = `${d.getMonth()+1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;
  $('#wDow').textContent = DOW[d.getDay()] + '요일'; $('#wDay').textContent = d.getDate();
}
tick(); setInterval(tick, 1000);

let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 1800); }

// 뒤로가기용 오버레이 스택 (시트, 라이트박스, 뷰어 등)
function makeStack() { const st = []; return { push: f => st.push(f), remove: f => { const i = st.indexOf(f); if (i >= 0) st.splice(i, 1); }, pop: () => st.length ? (st.pop()(), true) : false, get size() { return st.length; } }; }

// 바텀 시트
function makeSheet(app, stack) {
  const bd = h('<div class="sheet-bd"></div>'), sh = h('<div class="sheet"><div class="grab"><i></i></div><div class="sheet-in"></div></div>');
  app.append(bd, sh);
  const inner = $('.sheet-in', sh); let open = false;
  const api = {
    get isOpen() { return open; },
    open(html, { tall = false } = {}) { inner.innerHTML = html; sh.classList.toggle('tall', tall); sh.style.transform = ''; bd.classList.add('on'); sh.classList.add('on'); open = true; stack && stack.push(api.close); return inner; },
    close() { stack && stack.remove(api.close); bd.classList.remove('on'); sh.classList.remove('on'); sh.style.transform = ''; open = false; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); },
  };
  bd.addEventListener('click', api.close);
  const grab = $('.grab', sh); let sy = null;
  grab.addEventListener('pointerdown', e => { sy = e.clientY; grab.setPointerCapture(e.pointerId); sh.style.transition = 'none'; });
  grab.addEventListener('pointermove', e => { if (sy == null) return; sh.style.transform = `translateY(${Math.max(0, (e.clientY - sy) / getScale())}px)`; });
  const end = e => { if (sy == null) return; const dy = (e.clientY - sy) / getScale(); sy = null; sh.style.transition = ''; if (dy > 90) api.close(); else sh.style.transform = ''; };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  return api;
}

// 사진 확대 보기(라이트박스)
function lightbox(app, stack, src) {
  const lb = h(`<div class="lb"><img src="${src}" alt=""><button class="lb-x">${I.close}</button></div>`);
  app.append(lb); const prev = screen.dataset.t; setTheme('light');
  lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
  $('img', lb).animate([{ transform: 'scale(.86)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: EASE });
  const close = () => { stack.remove(close); setTheme(prev); lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.then(() => lb.remove()); };
  lb.addEventListener('click', close); stack.push(close);
}

// 큰 제목 스크롤 시 상단 바에 작은 제목 표시
function bindNav(scrollEl, navEl, th = 36) {
  const f = () => navEl.classList.toggle('collapsed', scrollEl.scrollTop > th);
  scrollEl.addEventListener('scroll', f, { passive: true }); f();
}

// 슬라이더(재생바/볼륨)
function slider(el, { onInput, onCommit }) {
  let drag = false;
  const frac = e => { const r = el.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
  el.addEventListener('pointerdown', e => { drag = true; el.setPointerCapture(e.pointerId); el.classList.add('drag'); onInput(frac(e)); });
  el.addEventListener('pointermove', e => { if (drag) onInput(frac(e)); });
  const end = e => { if (!drag) return; drag = false; el.classList.remove('drag'); onCommit && onCommit(frac(e)); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  return { set(f) { if (!drag) el.style.setProperty('--p', f); }, get drag() { return drag; } };
}

// 앱을 아이콘 위치에서 확대/축소하는 모션
function zoom(el, rect, dir, radius = 14) {
  const W = screen.offsetWidth, H = screen.offsetHeight;
  const sx = Math.max(rect.w / W, .02), sy = Math.max(rect.h / H, .02);
  const dx = rect.x + rect.w / 2 - W / 2, dy = rect.y + rect.h / 2 - H / 2;
  const sr = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  const small = { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, borderRadius: `${radius / sx}px / ${radius / sy}px` };
  const big = { transform: 'translate(0,0) scale(1,1)', borderRadius: `${sr}px` };
  const frames = dir === 'in'
    ? [{ ...small, opacity: 0 }, { opacity: 1, offset: .3 }, { ...big, opacity: 1 }]
    : [{ ...big, opacity: 1 }, { opacity: 1, offset: .7 }, { ...small, opacity: 0 }];
  return el.animate(frames, { duration: dir === 'in' ? 520 : 440, easing: 'cubic-bezier(.22,.9,.26,1)', fill: dir === 'in' ? 'none' : 'forwards' });
}

/* ================================================================
   5. 잠금화면 / 홈화면 / 네비게이션
   ================================================================ */
// 배경화면 적용
$('#lockWp').style.backgroundImage = `url('${CONFIG.wallpaper.lock}'),linear-gradient(160deg,#3a4a8a,#8a4a8a)`;
$('#homeWp').style.backgroundImage = `url('${CONFIG.wallpaper.home}'),linear-gradient(160deg,#2d3a6b,#6b3a5e)`;
$('#wPhoto').style.backgroundImage = `url('${CONFIG.widgetPhoto.src}')`;
$('#wPhotoCap').textContent = CONFIG.widgetPhoto.caption;
$('#wEv').innerHTML = `${esc(CONFIG.widgetEvent.title)}<small>${esc(CONFIG.widgetEvent.time)}</small>`;
$('#flashBtn').innerHTML = I.flash; $('#camBtn').innerHTML = I.camera;
$('#bkBtn').innerHTML = I.chev + '뒤로';
$('#hmBtn').innerHTML = S('<circle cx="12" cy="12" r="8"/>') + '홈';
$('#lkBtn').innerHTML = I.lock + '잠금';
edgeEl.innerHTML = I.chev;

// 잠금화면 알림
$('#lNotifs').innerHTML = CONFIG.lockNotifs.map((n, i) => `<button class="notif" data-app="${n.app}" style="--n:${i}">${appIcon(n.app)}<div class="nt"><div class="nh"><span>${esc((CONFIG.apps[n.app] || {}).label || '')}</span><span>${esc(n.time)}</span></div><b>${esc(n.title)}</b><p>${esc(n.body)}</p></div></button>`).join('');

// 홈 아이콘 그리드 / 독
const HOME_APPS = [
  'gallery',
  'instagram',
  'x',
  'messages',
  'music',
  'notes',
  'calendar',
  'youtube'
];
$('#grid').innerHTML = HOME_APPS.map((k, i) => `<button class="app-icon" data-app="${k}" style="--i:${i + 2}">${appIcon(k)}<span>${esc(CONFIG.apps[k].label)}</span>${CONFIG.apps[k].badge ? `<b class="bdg" data-bdg="${k}">${CONFIG.apps[k].badge}</b>` : `<b class="bdg" data-bdg="${k}" hidden></b>`}</button>`).join('');
$('#dock').innerHTML = ['phone', 'safari', 'mail', 'camera'].map((k, i) =>
  `<button class="app-icon" ${k === 'phone' ? 'data-app="phone"' : 'data-dummy="' + k + '"'} style="--i:${i + 9}">${appIcon(k)}</button>`
).join('');
function setBadge(key, n) { const b = $(`[data-bdg="${key}"]`); if (!b) return; b.textContent = n; b.hidden = !n; }

function bumpHome() { homeUi.classList.remove('bump'); void homeUi.offsetWidth; homeUi.classList.add('bump'); }

/* ---- 잠금 해제 (아래→위 스와이프) ---- */
const padlock = $('#padlock');
let drag = null;
function applyDrag(dy) {
  const H = screen.offsetHeight, p = clamp(dy / (H * .55), 0, 1);
  lock.style.transform = `translateY(${-dy}px)`;
  lock.style.opacity = String(1 - p * .45);
  homeUi.style.opacity = String(p);
  homeUi.style.transform = `scale(${1.16 - .16 * p})`;
  padlock.classList.toggle('open', dy > 26);
}
lock.addEventListener('pointerdown', e => {
  if (state.view !== 'lock' || state.anim || e.target.closest('.l-btn')) return;
  drag = { y: e.clientY, t: performance.now(), dy: 0, moved: false, target: e.target };
  lock.setPointerCapture(e.pointerId);
  lock.classList.add('dragging'); home.classList.add('dragging');
});
lock.addEventListener('pointermove', e => {
  if (!drag) return;
  const raw = (drag.y - e.clientY) / getScale();
  if (Math.abs(raw) > 5) drag.moved = true;
  drag.dy = raw > 0 ? raw : raw * .15;
  applyDrag(Math.max(drag.dy, 0));
});
const endLockDrag = e => {
  if (!drag) return;
  const d = drag; drag = null;
  lock.classList.remove('dragging'); home.classList.remove('dragging');
  const H = screen.offsetHeight, v = d.dy / Math.max(1, performance.now() - d.t);
  if (!d.moved) { // 탭
    const n = d.target.closest && d.target.closest('.notif');
    if (n) { const k = n.dataset.app; unlock(() => setTimeout(() => openApp(k, $(`.app-icon[data-app="${k}"]`)), 380)); }
    else { lockUi.classList.remove('bump'); void lockUi.offsetWidth; lockUi.classList.add('bump'); }
    return;
  }
  if (d.dy > H * .17 || (v > .55 && d.dy > 30)) unlock();
  else { // 원위치
    lock.classList.add('snap'); homeUi.classList.add('snap');
    lock.style.transform = ''; lock.style.opacity = ''; homeUi.style.opacity = ''; homeUi.style.transform = '';
    padlock.classList.remove('open');
    setTimeout(() => { lock.classList.remove('snap'); homeUi.classList.remove('snap'); }, 560);
  }
};
lock.addEventListener('pointerup', endLockDrag); lock.addEventListener('pointercancel', endLockDrag);
lock.addEventListener('wheel', e => { if (e.deltaY > 30) unlock(); }, { passive: true });

function unlock(cb) {
  if (state.view !== 'lock' || state.anim) return;
  state.anim = true;
  const H = screen.offsetHeight;
  lock.classList.remove('dragging'); home.classList.remove('dragging');
  lock.classList.add('snap'); homeUi.classList.add('snap');
  lock.style.transform = `translateY(${-H}px)`; lock.style.opacity = '0';
  homeUi.style.opacity = '1'; homeUi.style.transform = 'scale(1)';
  padlock.classList.add('open');
  home.classList.remove('enter'); void home.offsetWidth; home.classList.add('enter');
  setTimeout(() => {
    lock.hidden = true; lock.classList.remove('snap'); homeUi.classList.remove('snap');
    lock.style.transform = lock.style.opacity = homeUi.style.opacity = homeUi.style.transform = '';
    home.classList.remove('pre');
    state.view = 'home'; state.anim = false;
    cb && cb();
  }, 580);
}

// 화면 잠금(전원 버튼)
function lockPhone() {
  if (state.anim || state.view === 'lock') return;
  off.classList.add('on');
  setTimeout(() => {
    if (state.view === 'app' && appEls[state.app]) appEls[state.app].hidden = true;
    state.app = null; home.classList.remove('app-open'); home.classList.add('pre'); home.classList.remove('enter');
    lock.hidden = false; lock.className = 'layer lock'; lock.style.cssText = '';
    padlock.classList.remove('open'); setTheme('light'); state.view = 'lock'; tick();
    void lock.offsetWidth; lock.classList.add('show');
    off.classList.remove('on');
  }, 320);
}

/* ---- 앱 열기 / 닫기 ---- */
function openApp(id, iconEl) {
  if (state.anim || state.view === 'lock' || state.view === 'app') return;
  const def = APPS[id]; if (!def) return;
  let el = appEls[id];
  if (!el) { el = h(`<section class="app" data-app="${id}"></section>`); appLayer.append(el); appEls[id] = el; def.api = def.build(el); }
  state.anim = true; state.app = id; state.view = 'app';
  const rect = local(iconEl || $(`.app-icon[data-app="${id}"]`)); state.origin = rect;
  home.classList.add('app-open');
  setTheme(def.theme || 'dark');
  el.hidden = false;
  zoom(el, rect, 'in').finished.then(() => { state.anim = false; if (def.api && def.api.onOpen) def.api.onOpen(); });
}
function closeApp() {
  const id = state.app, el = appEls[id];
  if (!el || state.anim) return;
  state.anim = true; setTheme('light'); home.classList.remove('app-open');
  const a = zoom(el, state.origin || { x: 150, y: 350, w: 60, h: 60 }, 'out');
  a.finished.then(() => { el.hidden = true; a.cancel(); state.view = 'home'; state.app = null; state.anim = false; });
}
function goHome() { if (state.view === 'app') closeApp(); else if (state.view === 'home') bumpHome(); else if (state.view === 'lock') unlock(); }
function goBack() {
  if (state.anim) return;
  if (state.view === 'app') { const api = APPS[state.app].api; if (api && api.back && api.back()) return; closeApp(); }
  else if (state.view === 'home') bumpHome();
}

/* ---- 입력 연결 ---- */
home.addEventListener('click', e => {
  const b = e.target.closest('[data-app]');
  if (b && state.view === 'home') return openApp(b.dataset.app, b);
  const d = e.target.closest('[data-dummy]');
  if (d) { d.animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE }); toast('이 데모에서는 열 수 없는 앱이에요'); }
});
screen.addEventListener('click', e => { if (e.target.closest('[data-back]')) goBack(); });
let hbDown = false;
homebar.addEventListener('pointerdown', e => { hbDown = true; homebar.setPointerCapture(e.pointerId); });
homebar.addEventListener('pointerup', () => { if (!hbDown) return; hbDown = false; goHome(); });
homebar.addEventListener('pointercancel', () => { hbDown = false; });
$('#power').addEventListener('click', lockPhone);
$('#bkBtn').addEventListener('click', goBack);
$('#hmBtn').addEventListener('click', goHome);
$('#lkBtn').addEventListener('click', lockPhone);
$('#flashBtn').addEventListener('click', e => { e.currentTarget.classList.toggle('lit'); lock.classList.toggle('flash'); });
$('#camBtn').addEventListener('click', () => toast('카메라는 데모에서 지원하지 않아요'));

addEventListener('keydown', e => {
  const typing = e.target.matches && e.target.matches('input,textarea,[contenteditable="true"]');
  if (e.key === 'Escape') { if (typing) { e.target.blur(); return; } goBack(); }
  if (typing) return;
  if (state.view === 'lock' && ['ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); unlock(); }
  else if (e.key.toLowerCase() === 'h' || e.key === 'Home') goHome();
  else if (e.key.toLowerCase() === 'l') lockPhone();
});

// 화면 왼쪽 가장자리에서 오른쪽으로 스와이프 = 뒤로가기
let edge = null;
screen.addEventListener('pointerdown', e => {
  if (state.view !== 'app' || state.anim) return;
  const r = screen.getBoundingClientRect(), x = (e.clientX - r.left) / getScale();
  if (x <= 20) edge = { x: e.clientX };
});
addEventListener('pointermove', e => {
  if (!edge) return;
  const p = clamp((e.clientX - edge.x) / getScale() / 70, 0, 1);
  edgeEl.style.transition = 'none'; edgeEl.style.opacity = p; edgeEl.style.transform = `translateX(${p * 56 - 40}px) scale(${.6 + p * .4})`;
});
const endEdge = e => {
  if (!edge) return;
  const dx = (e.clientX - edge.x) / getScale(); edge = null;
  edgeEl.style.transition = 'all .3s ' + EASE; edgeEl.style.opacity = 0; edgeEl.style.transform = 'translateX(-40px)';
  if (dx > 70) goBack();
};
addEventListener('pointerup', endEdge); addEventListener('pointercancel', endEdge);

// PC 마우스로 끌어서 스크롤 (터치는 기본 스크롤 사용)
let ds = null;
screen.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  if (e.target.closest('input,textarea,[contenteditable="true"],.slider,.viewer,.lock,.homebar,.np-art,.np-head,.grab')) return;
  const v = e.target.closest('.scroll,.msgs,.n-ed,.cm-list,.as-detail'), hs = e.target.closest('.hscroll,.slides');
  if (!v && !hs) return;
  ds = { v, hs, x: e.clientX, y: e.clientY, sl: hs ? hs.scrollLeft : 0, st: v ? v.scrollTop : 0, moved: false };
});
addEventListener('pointermove', e => {
  if (!ds) return;
  const s = getScale(), dx = (e.clientX - ds.x) / s, dy = (e.clientY - ds.y) / s;
  if (!ds.moved && Math.hypot(dx, dy) > 6) { ds.moved = true; if (ds.hs && ds.hs.classList.contains('slides')) ds.hs.style.scrollSnapType = 'none'; }
  if (!ds.moved) return;
  if (ds.hs && Math.abs(dx) > Math.abs(dy)) ds.hs.scrollLeft = ds.sl - dx; else if (ds.v) ds.v.scrollTop = ds.st - dy;
});
addEventListener('pointerup', () => {
  if (!ds) return;
  if (ds.moved) {
    const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
    screen.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => screen.removeEventListener('click', stop, true), 0);
    if (ds.hs && ds.hs.classList.contains('slides')) { const w = ds.hs.clientWidth; ds.hs.scrollTo({ left: Math.round(ds.hs.scrollLeft / w) * w, behavior: 'smooth' }); setTimeout(() => { ds && 0; }, 0); const hs = ds.hs; setTimeout(() => { hs.style.scrollSnapType = ''; }, 400); }
  }
  ds = null;
});

/* ================================================================
   6. 앱: 갤러리
   ================================================================ */
function buildGallery(el) {
  const P = CONFIG.gallery.photos, AL = CONFIG.gallery.albums, stack = makeStack();
  const favs = new Set(CONFIG.gallery.favorites);
  el.classList.add('has-tab');
  const th = i => `<button class="th" data-i="${i}"><img class="px" src="${IMG(P[i].seed, 360, 360)}" alt="" loading="lazy"></button>`;
  const allIdx = P.map((_, i) => i);
  el.innerHTML = `
    <div class="navbar" id="gNav">
      <button class="back-btn" data-back>${I.chev}<span id="gBackL">홈</span></button>
      <div class="nb-title" id="gTitle">보관함</div>
      <button class="txt-btn" data-toast="선택 모드는 데모에서 지원하지 않아요">선택</button>
    </div>
    <div class="scroll" id="gScroll">
      <section class="pane on" data-pane="lib" data-t="보관함">
        <h1 class="large-title">보관함</h1>
        <div class="seg"><button>연</button><button>월</button><button>일</button><button class="on">모든 사진</button></div>
        <div class="ggrid" id="gGrid" data-list="lib" style="--cols:4">${allIdx.map(th).join('')}</div>
        <div class="gcount">사진 ${P.length}장<small>동영상 3개</small></div>
      </section>
      <section class="pane" data-pane="you" data-t="For You">
        <h1 class="large-title">For You</h1>
        <div class="empty">${I.star}<b style="color:#111;font-size:18px">추억이 곧 표시됩니다</b>사진을 더 찍으면 추억과 추천 항목이 이곳에 나타나요.</div>
      </section>
      <section class="pane" data-pane="alb" data-t="앨범">
        <h1 class="large-title">앨범</h1>
        <div class="albums">${AL.map((a, i) => `<button class="alb" data-al="${i}"><div class="cv"><img class="px" src="${IMG(P[a.idx[0]].seed, 400, 400)}" alt="" loading="lazy"></div><b>${esc(a.name)}</b><small>${a.idx.length}</small></button>`).join('')}</div>
      </section>
      <section class="pane" data-pane="albd" data-t="">
        <h1 class="large-title" id="albdT"></h1>
        <div class="ggrid" data-list="albd" id="albdGrid" style="--cols:3"></div>
      </section>
      <section class="pane" data-pane="find" data-t="검색">
        <h1 class="large-title">검색</h1>
        <label class="searchbox">${I.search}<input id="gQ" placeholder="사진, 장소, 제목" autocomplete="off"></label>
        <div class="ggrid" data-list="find" id="findGrid" style="--cols:4"></div>
        <div class="empty" id="findEmpty" hidden>${I.search}검색 결과가 없습니다</div>
      </section>
    </div>
    <div class="tabbar">
      <button class="tab on" data-tab="lib">${I.photo}<span>보관함</span></button>
      <button class="tab" data-tab="you">${I.star}<span>For You</span></button>
      <button class="tab" data-tab="alb">${I.albums}<span>앨범</span></button>
      <button class="tab" data-tab="find">${I.search}<span>검색</span></button>
    </div>
    <div class="viewer" hidden>
      <div class="v-bg"></div>
      <img class="v-img" alt="">
      <div class="v-heart">${I.heartF}</div>
      <div class="v-top"><button class="back-btn" data-back>${I.chev}<span>보관함</span></button><div class="v-title"><b></b><small></small></div><span style="width:78px"></span></div>
      <div class="v-bottom"><button data-v="share">${I.share}</button><button class="fav" data-v="fav">${I.heart}</button><button data-v="info">${I.info}</button><button data-v="del">${I.trash}</button></div>
    </div>`;
  const scroll = $('#gScroll', el), nav = $('#gNav', el);
  bindNav(scroll, nav);
  let cur = 'lib', lists = { lib: allIdx, albd: [], find: allIdx };

  function show(name) {
    cur = name;
    $$('.pane', el).forEach(p => p.classList.toggle('on', p.dataset.pane === name));
    $$('.tab', el).forEach(t => t.classList.toggle('on', t.dataset.tab === (name === 'albd' ? 'alb' : name)));
    scroll.scrollTop = 0;
    const p = $(`.pane[data-pane="${name}"]`, el);
    $('#gTitle', el).textContent = name === 'albd' ? $('#albdT', el).textContent : p.dataset.t;
    $('#gBackL', el).textContent = name === 'albd' ? '앨범' : '홈';
    p.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE });
    nav.classList.remove('collapsed'); bindNavCheck();
  }
  const bindNavCheck = () => nav.classList.toggle('collapsed', scroll.scrollTop > 36);
  function renderFind(q) {
    q = q.trim().toLowerCase();
    const res = allIdx.filter(i => !q || (P[i].title + P[i].place).toLowerCase().includes(q));
    lists.find = res; $('#findGrid', el).innerHTML = res.map(th).join(''); $('#findEmpty', el).hidden = res.length > 0;
  }
  renderFind('');
  $('#gQ', el).addEventListener('input', e => renderFind(e.target.value));

  el.addEventListener('click', e => {
    const t = e.target.closest('[data-toast]'); if (t) return toast(t.dataset.toast);
    const tab = e.target.closest('.tab'); if (tab) return show(tab.dataset.tab);
    const seg = e.target.closest('.seg button');
    if (seg) { $$('.seg button', el).forEach(b => b.classList.toggle('on', b === seg)); const cols = { '연': 7, '월': 5, '일': 3, '모든 사진': 4 }[seg.textContent]; const g = $('#gGrid', el); g.style.setProperty('--cols', cols); g.animate([{ opacity: .35, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE }); return; }
    const al = e.target.closest('.alb');
    if (al) { const a = AL[+al.dataset.al]; lists.albd = a.idx; $('#albdT', el).textContent = a.name; $('#albdGrid', el).innerHTML = a.idx.map(th).join(''); return show('albd'); }
    const tb = e.target.closest('.th');
    if (tb && !V.contains(tb)) { const list = lists[tb.closest('[data-list]').dataset.list], i = +tb.dataset.i; openViewer(list, list.indexOf(i), tb); }
  });

  /* ---- 사진 뷰어 ---- */
  const V = $('.viewer', el), vImg = $('.v-img', V), vBg = $('.v-bg', V), vHeart = $('.v-heart', V), favBtn = $('.fav', V);
  let vList = [], vPos = 0, vBusy = false;
  const fitBox = p => { const W = V.offsetWidth, H = V.offsetHeight, r = P[p].w / P[p].h, w = Math.min(W, H * r); return { left: (W - w) / 2, top: (H - w / r) / 2, width: w, height: w / r }; };
  const px = b => ({ left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
  const thumbOf = p => $$('.pane.on .th', el).find(t => +t.dataset.i === p);
  function setImg(pos) {
    const p = vList[pos]; vPos = pos;
    Object.assign(vImg.style, px(fitBox(p))); vImg.src = IMG(P[p].seed, P[p].w, P[p].h);
    $('.v-title b', V).textContent = P[p].title; $('.v-title small', V).textContent = `${dateStr(P[p].date)} ${clockStr(P[p].date)}`;
    favBtn.classList.toggle('on', favs.has(p)); favBtn.innerHTML = favs.has(p) ? I.heartF : I.heart;
    $$('.th', el).forEach(t => { t.style.visibility = (+t.dataset.i === p && !V.contains(t)) ? 'hidden' : ''; });
  }
  function toggleFav(pop) {
    const p = vList[vPos]; favs.has(p) ? favs.delete(p) : favs.add(p);
    favBtn.classList.toggle('on', favs.has(p)); favBtn.innerHTML = favs.has(p) ? I.heartF : I.heart;
    if (pop && favs.has(p)) { vHeart.classList.remove('go'); void vHeart.offsetWidth; vHeart.classList.add('go'); }
  }
  function openViewer(list, pos, thumb) {
    vList = list; V.hidden = false; V.classList.remove('hide-ui'); vImg.style.transform = ''; setTheme('light'); vBusy = true;
    setImg(pos);
    const b = fitBox(list[pos]), r = local(thumb);
    vBg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340 });
    $$('.v-top,.v-bottom', V).forEach(x => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 160, fill: 'backwards' }));
    vImg.animate([{ left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }, px(b)], { duration: 460, easing: 'cubic-bezier(.2,.85,.25,1)' }).finished.then(() => { vBusy = false; });
    stack.push(closeViewer);
  }
  function closeViewer() {
    if (V.hidden) return; stack.remove(closeViewer);
    const p = vList[vPos], t = thumbOf(p); setTheme('dark');
    const cur = local(vImg); vImg.style.transform = 'none'; Object.assign(vImg.style, { left: cur.x + 'px', top: cur.y + 'px', width: cur.w + 'px', height: cur.h + 'px' });
    vBg.animate([{ opacity: vBg.style.opacity || 1 }, { opacity: 0 }], { duration: 340, fill: 'forwards' });
    $$('.v-top,.v-bottom', V).forEach(x => x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
    let a;
    if (t) { t.style.visibility = 'hidden'; const r = local(t); a = vImg.animate([{ left: cur.x + 'px', top: cur.y + 'px', width: cur.w + 'px', height: cur.h + 'px' }, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }], { duration: 380, easing: EASE, fill: 'forwards' }); }
    else a = vImg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    a.finished.then(() => { V.hidden = true; $$('.th', el).forEach(x => x.style.visibility = ''); [vImg, vBg, ...$$('.v-top,.v-bottom', V)].forEach(x => { x.getAnimations().forEach(y => y.cancel()); x.style.opacity = ''; }); });
  }
  function go(dir) {
    const n = vPos + dir;
    if (n < 0 || n >= vList.length) { vImg.animate([{ transform: `translateX(${dx0}px)` }, { transform: 'translateX(0)' }], { duration: 300, easing: EASE }); vImg.style.transform = ''; return; }
    vBusy = true; const W = V.offsetWidth;
    vImg.animate([{ transform: `translateX(${dx0}px)` }, { transform: `translateX(${-dir * W}px)` }], { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished.then(() => {
      vImg.getAnimations().forEach(a => a.cancel()); vImg.style.transform = ''; setImg(n);
      vImg.animate([{ transform: `translateX(${dir * W}px)` }, { transform: 'translateX(0)' }], { duration: 300, easing: EASE }).finished.then(() => { vBusy = false; });
    });
  }
  let vs = null, dx0 = 0, lastTap = 0;
  V.addEventListener('pointerdown', e => { if (e.target.closest('button') || vBusy) return; vs = { x: e.clientX, y: e.clientY, mode: null, dx: 0, dy: 0, t: performance.now() }; V.setPointerCapture(e.pointerId); });
  V.addEventListener('pointermove', e => {
    if (!vs) return; const s = getScale(); vs.dx = (e.clientX - vs.x) / s; vs.dy = (e.clientY - vs.y) / s;
    if (!vs.mode && Math.hypot(vs.dx, vs.dy) > 8) vs.mode = Math.abs(vs.dx) > Math.abs(vs.dy) ? 'h' : 'v';
    if (vs.mode === 'h') { dx0 = vs.dx; vImg.style.transform = `translateX(${vs.dx}px)`; }
    else if (vs.mode === 'v') { const d = Math.max(vs.dy, 0); vImg.style.transform = `translate(${vs.dx * .6}px,${vs.dy}px) scale(${1 - d / 1600})`; vBg.style.opacity = String(1 - clamp(d / 380, 0, .85)); V.classList.add('hide-ui'); }
  });
  const vEnd = () => {
    if (!vs) return; const d = vs; vs = null;
    if (d.mode === 'h') { if (Math.abs(d.dx) > 70 || Math.abs(d.dx) / Math.max(1, performance.now() - d.t) > .5) { dx0 = d.dx; go(d.dx < 0 ? 1 : -1); } else { vImg.animate([{ transform: `translateX(${d.dx}px)` }, { transform: 'none' }], { duration: 320, easing: EASE }); vImg.style.transform = ''; } }
    else if (d.mode === 'v') { if (d.dy > 110) { vBg.style.opacity = ''; closeViewer(); } else { vImg.animate([{ transform: vImg.style.transform }, { transform: 'none' }], { duration: 340, easing: EASE }); vImg.style.transform = ''; vBg.style.opacity = ''; V.classList.remove('hide-ui'); } }
    else { // 탭 / 더블탭
      const now = performance.now();
      if (now - lastTap < 300) { lastTap = 0; const p = vList[vPos]; if (!favs.has(p)) toggleFav(true); else { vHeart.classList.remove('go'); void vHeart.offsetWidth; vHeart.classList.add('go'); } }
      else { lastTap = now; setTimeout(() => { if (lastTap === now) V.classList.toggle('hide-ui'); }, 300); }
    }
  };
  V.addEventListener('pointerup', vEnd); V.addEventListener('pointercancel', vEnd);
  $('.v-bottom', V).addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    if (b.dataset.v === 'fav') toggleFav(true);
    else if (b.dataset.v === 'share') toast('공유 시트는 데모에서 열리지 않아요');
    else if (b.dataset.v === 'info') toast(`${P[vList[vPos]].place} · ${P[vList[vPos]].w}×${P[vList[vPos]].h}`);
    else toast('삭제는 데모에서 지원하지 않아요');
  });

  return { back() { if (stack.pop()) return true; if (cur === 'albd') { show('alb'); return true; } return false; } };
}

/* ================================================================
   7. 앱: 인스타그램 스타일
   ================================================================ */
function buildInstagram(el) {
  const C = CONFIG.instagram, me = CONFIG.owner, stack = makeStack(), sheet = makeSheet(el, stack);
  const P = CONFIG.gallery.photos;
  el.classList.add('has-tab');
  const posts = C.posts.map(p => ({ ...p, liked: false, saved: false, cm: p.comments.slice() }));
  const stories = C.stories.map(s => ({ ...s, seen: false }));
  const nm = u => ({ name: u.name || u, avatar: u.avatar });

  const storyHTML = stories.map((s, i) => `<button class="story" data-s="${i}"><span class="ring ${s.me ? 'me' : ''}" data-ring="${i}">${av(nm(s), 'fill')}</span>${s.me ? `<span class="plus">${I.plus}</span>` : ''}<span class="n">${esc(s.name)}</span></button>`).join('');
  const postHTML = (p, i) => `
    <article class="post" data-p="${i}">
      <header><span class="ring sm">${av({ name: p.name, avatar: p.avatar }, 'fill')}</span><div class="who"><b>${esc(p.user)}</b>${p.place ? `<small>${esc(p.place)}</small>` : ''}</div><button class="more" data-act="more">${I.more}</button></header>
      <div class="media"><div class="slides">${p.images.map(src => `<img class="px" src="${src}" alt="" loading="lazy">`).join('')}</div>${p.images.length > 1 ? `<span class="m-count">1/${p.images.length}</span>` : ''}<div class="dbl">${I.heartF}</div></div>
      <div class="acts"><button data-act="like">${I.heart}</button><button data-act="cmt">${I.comment}</button><button data-act="share">${I.send}</button>${p.images.length > 1 ? `<div class="pg">${p.images.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>` : ''}<span class="sp"></span><button data-act="save">${I.bookmark}</button></div>
      <div class="likes">좋아요 ${fmtc(p.likes)}개</div>
      <p class="cap"><b>${esc(p.user)}</b>${esc(p.caption)}</p>
      <button class="cmt-link" data-act="cmt">댓글 ${p.commentCount}개 모두 보기</button>
      <time>${esc(p.time)}</time>
    </article>`;
  const hlPhotos = [0, 3, 7, 15, 19, 23, 12, 5, 9];

  el.innerHTML = `
    <div class="navbar solid">
      <button class="back-btn" data-back style="color:#111">${I.chev}</button>
      <div class="nb-title always ig-title" id="igT">Instagram</div>
      <div class="nb-r"><button data-toast="알림은 데모에서 지원하지 않아요">${I.heart}</button><button data-toast="DM은 메시지 앱에서 확인하세요">${I.send}</button></div>
    </div>
    <div class="scroll" id="igScroll">
      <section class="pane on" data-pane="home" data-t="Instagram">
        <div class="stories hscroll">${storyHTML}</div>
        <div id="igFeed">${posts.map(postHTML).join('')}</div>
      </section>
      <section class="pane" data-pane="explore" data-t="탐색">
        <div class="searchbox" style="margin-top:8px">${I.search}<input placeholder="검색" readonly></div>
        <div class="xgrid">${C.exploreSeeds.map((s, i) => `<button class="${(i === 1 || i === 10) ? 'big' : ''}" data-lb="${IMG(s, 900, 1000)}"><img class="px" src="${IMG(s, (i === 1 || i === 10) ? 600 : 300, (i === 1 || i === 10) ? 600 : 300)}" alt="" loading="lazy"></button>`).join('')}</div>
      </section>
      <section class="pane" data-pane="profile" data-t="${esc(me.handle)}">
        <div class="prof">
          <div class="prof-top"><span class="ring" style="width:92px;height:92px">${av(me, 'fill')}</span>
            <div class="prof-stats"><div><b>${P.length}</b><span>게시물</span></div><div><b>1,284</b><span>팔로워</span></div><div><b>312</b><span>팔로잉</span></div></div></div>
          <div class="prof-bio"><b>${esc(me.name)}</b>${esc(me.bio)}</div>
          <div class="prof-btns"><button data-toast="프로필 편집은 데모에서 지원하지 않아요">프로필 편집</button><button data-toast="프로필 링크를 복사했어요">프로필 공유</button></div>
          <div class="hl hscroll">${C.highlights.map(x => `<div><i style="background-image:url('${IMG(x.seed, 160, 160)}')"></i>${esc(x.n)}</div>`).join('')}</div>
        </div>
        <div class="xgrid">${hlPhotos.map(i => `<button data-lb="${IMG(P[i].seed, P[i].w, P[i].h)}"><img class="px" src="${IMG(P[i].seed, 300, 300)}" alt="" loading="lazy"></button>`).join('')}</div>
      </section>
    </div>
    <div class="tabbar" style="--accent:#111">
      <button class="tab on" data-tab="home">${I.home}</button>
      <button class="tab" data-tab="explore">${I.search}</button>
      <button class="tab" data-toast="게시물 작성은 데모에서 지원하지 않아요">${I.plusSq}</button>
      <button class="tab" data-toast="릴스는 데모에서 지원하지 않아요">${I.reels}</button>
      <button class="tab" data-tab="profile">${av(me, 'xs')}</button>
    </div>
    <div class="stv" hidden>
      <img class="stv-img" alt="">
      <div class="stv-top"><div class="stv-bar"><i></i></div><div class="stv-user"><span id="stvAv"></span><span id="stvName"></span><small>방금</small><button class="x" data-stvx>${I.close}</button></div></div>
      <div class="stv-reply">메시지 보내기...</div>
    </div>`;
  const scroll = $('#igScroll', el);

  function show(name) {
    $$('.pane', el).forEach(p => p.classList.toggle('on', p.dataset.pane === name));
    $$('.tab[data-tab]', el).forEach(t => t.classList.toggle('on', t.dataset.tab === name));
    const p = $(`.pane[data-pane="${name}"]`, el); $('#igT', el).textContent = p.dataset.t; $('#igT', el).classList.toggle('ig-title', name === 'home');
    scroll.scrollTop = 0; p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  }

  // 좋아요
  function setLike(p, art, on) {
    p.liked = on; p.likes += on ? 1 : -1;
    const b = $('[data-act="like"]', art); b.classList.toggle('liked', on); b.innerHTML = on ? I.heartF : I.heart;
    $('.likes', art).textContent = `좋아요 ${fmtc(p.likes)}개`;
  }
  const lastTap = new WeakMap();
  el.addEventListener('click', e => {
    const tt = e.target.closest('[data-toast]'); if (tt) return toast(tt.dataset.toast);
    const tab = e.target.closest('.tab[data-tab]'); if (tab) return show(tab.dataset.tab);
    const lb = e.target.closest('[data-lb]'); if (lb) return lightbox(el, stack, lb.dataset.lb);
    const st = e.target.closest('.story'); if (st) return openStory(+st.dataset.s);
    const art = e.target.closest('.post'); if (!art) return;
    const p = posts[+art.dataset.p], act = e.target.closest('[data-act]');
    if (act) {
      const a = act.dataset.act;
      if (a === 'like') setLike(p, art, !p.liked);
      else if (a === 'save') { p.saved = !p.saved; act.innerHTML = p.saved ? I.bookmarkF : I.bookmark; if (p.saved) toast('저장됨'); }
      else if (a === 'share') toast('공유 시트는 데모에서 열리지 않아요');
      else if (a === 'more') toast('더보기 메뉴는 데모에서 지원하지 않아요');
      else if (a === 'cmt') openComments(p, art);
      return;
    }
    if (e.target.closest('.media')) { // 더블탭 좋아요
      const m = e.target.closest('.media'), now = performance.now();
      if (now - (lastTap.get(m) || 0) < 320) { lastTap.set(m, 0); if (!p.liked) setLike(p, art, true); const d = $('.dbl', m); d.classList.remove('go'); void d.offsetWidth; d.classList.add('go'); }
      else lastTap.set(m, now);
    }
  });
  // 캐러셀 점 표시
  el.addEventListener('scroll', e => {
    const s = e.target; if (!s.classList || !s.classList.contains('slides')) return;
    const i = Math.round(s.scrollLeft / s.clientWidth), art = s.closest('.post');
    $$('.pg i', art).forEach((d, k) => d.classList.toggle('on', k === i)); const c = $('.m-count', art); if (c) c.textContent = `${i + 1}/${s.children.length}`;
  }, true);

  // 댓글 시트
  function openComments(p, art) {
    const row = c => `<div class="cm">${av({ name: c.u }, 's')}<div><b>${esc(c.u)}</b>${esc(c.t)}<small>방금 · 답글 달기</small></div></div>`;
    const inner = sheet.open(`<div class="sheet-h">댓글</div><div class="cm-list">${row({ u: p.user, t: p.caption })}${p.cm.map(row).join('')}</div><div class="cm-in">${av(me, 's')}<input placeholder="${esc(p.user)}님에게 댓글 추가..." autocomplete="off"><button>게시</button></div>`);
    const inp = $('input', inner), btn = $('button', inner), list = $('.cm-list', inner);
    inp.addEventListener('input', () => btn.classList.toggle('on', inp.value.trim().length > 0));
    const post = () => {
      const t = inp.value.trim(); if (!t) return;
      const c = { u: me.handle, t }; p.cm.push(c); p.commentCount++;
      const n = h(row(c)); n.classList.add('new'); list.append(n); list.scrollTop = list.scrollHeight; inp.value = ''; btn.classList.remove('on');
      $('.cmt-link', art).textContent = `댓글 ${p.commentCount}개 모두 보기`;
    };
    btn.addEventListener('click', post); inp.addEventListener('keydown', e => { if (e.key === 'Enter') post(); });
  }

  // 스토리 뷰어
  const stv = $('.stv', el), bar = $('.stv-bar i', stv); let sIdx = 0;
  function renderStory() {
    const s = stories[sIdx]; s.seen = true; $(`[data-ring="${sIdx}"]`, el).classList.add('seen');
    $('.stv-img', stv).src = s.img; $('#stvAv', stv).innerHTML = av(nm(s), 'xs'); $('#stvName', stv).textContent = s.name;
    bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
  }
  function openStory(i) { sIdx = i; stv.hidden = false; setTheme('light'); renderStory(); stv.animate([{ opacity: 0, transform: 'scale(.88)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE }); stack.push(closeStory); }
  function closeStory() { if (stv.hidden) return; stack.remove(closeStory); setTheme('dark'); bar.classList.remove('run'); stv.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 260, easing: EASE }).finished.then(() => { stv.hidden = true; }); }
  const nextStory = d => { const n = sIdx + d; if (n < 0 || n >= stories.length) return closeStory(); sIdx = n; renderStory(); };
  bar.addEventListener('animationend', () => nextStory(1));
  let sDown = 0;
  stv.addEventListener('pointerdown', e => { if (e.target.closest('[data-stvx]')) return; sDown = performance.now(); stv.classList.add('hold'); });
  stv.addEventListener('pointerup', e => {
    stv.classList.remove('hold'); if (e.target.closest('[data-stvx]')) return closeStory();
    if (!sDown || performance.now() - sDown > 260) return;
    const r = stv.getBoundingClientRect(); nextStory((e.clientX - r.left) / r.width < .3 ? -1 : 1);
  });
  stv.addEventListener('pointercancel', () => stv.classList.remove('hold'));

  return { back() { return stack.pop(); } };
}

/* ================================================================
   8. 앱: X (트위터) 스타일
   ================================================================ */
function buildX(el) {
  const me = CONFIG.owner, stack = makeStack(), sheet = makeSheet(el, stack);
  el.classList.add('has-tab');
  const tweets = CONFIG.x.tweets.map((t, i) => ({ ...t, id: i, liked: false, rt: false }));
  let tab = 0, nextId = tweets.length;
  const link = s => esc(s).replace(/(#[\p{L}\d_]+|@[\w_]+)/gu, '<span class="lk">$1</span>');
  const tweetHTML = t => `
    <article class="tw" data-t="${t.id}">
      ${av(t, 'm')}
      <div class="tw-main">
        <div class="tw-head"><b>${esc(t.name)}</b>${t.verified ? I.verified : ''}<span>@${esc(t.handle)} · ${esc(t.time)}</span></div>
        <div class="tw-text">${link(t.text)}</div>
        ${t.img ? `<div class="tw-img" data-lb="${t.img}"><img class="px" src="${t.img}" alt="" loading="lazy"></div>` : ''}
        <div class="tw-acts">
          <button data-a="reply">${I.comment}<span>${fmt(t.replies)}</span></button>
          <button class="rt ${t.rt ? 'on' : ''}" data-a="rt">${I.repost}<span>${fmt(t.rts)}</span></button>
          <button class="lk ${t.liked ? 'on' : ''}" data-a="like">${I.heart}<span>${fmt(t.likes)}</span></button>
          <button data-a="views">${I.views}<span>${fmt(t.views)}</span></button>
          <button data-a="share">${I.share}</button>
        </div>
      </div>
    </article>`;
  el.innerHTML = `
    <div class="x-head">
      <div class="x-top"><button class="back-btn" data-back style="color:#111">${I.chev}</button><div class="ttl">X</div>${av(me, 'xs')}</div>
      <div class="x-tabs"><button class="on" data-tab="0">추천</button><button data-tab="1">팔로잉</button><div class="x-ind"><i></i></div></div>
    </div>
    <div class="scroll" id="xScroll" style="padding-top:0"><div class="x-feed" id="xFeed"></div></div>
    <button class="fab" id="xFab">${S('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.4"')}</button>
    <div class="tabbar" style="--accent:#0f1419">
      <button class="tab on">${I.home}</button><button class="tab" data-toast="검색은 데모에서 지원하지 않아요">${I.search}</button>
      <button class="tab" data-toast="알림은 데모에서 지원하지 않아요">${I.bell}</button><button class="tab" data-toast="쪽지는 메시지 앱에서 확인하세요">${I.mail}</button>
    </div>`;
  const feed = $('#xFeed', el), ind = $('.x-ind', el);
  function render(anim) {
    const list = tab === 0 ? tweets : tweets.filter(t => ['harin.daily', 'jun_films', 'daehan_run', 'yuna_draws'].includes(t.handle) || t.id >= CONFIG.x.tweets.length);
    feed.innerHTML = list.map(tweetHTML).join('') || `<div class="empty">팔로잉 중인 사람의 게시물이 없어요</div>`;
    if (anim) feed.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: EASE });
  }
  render(false);

  el.addEventListener('click', e => {
    const tt = e.target.closest('[data-toast]'); if (tt) return toast(tt.dataset.toast);
    const tb = e.target.closest('.x-tabs button');
    if (tb) { tab = +tb.dataset.tab; $$('.x-tabs button', el).forEach(b => b.classList.toggle('on', b === tb)); ind.style.transform = `translateX(${tab * 100}%)`; $('#xScroll', el).scrollTop = 0; return render(true); }
    if (e.target.closest('#xFab')) return compose();
    const lb = e.target.closest('[data-lb]'); if (lb) return lightbox(el, stack, lb.dataset.lb);
    const b = e.target.closest('[data-a]'); if (!b) return;
    const art = b.closest('.tw'), t = tweets.find(x => x.id === +art.dataset.t), a = b.dataset.a;
    if (a === 'like') { t.liked = !t.liked; t.likes += t.liked ? 1 : -1; b.classList.toggle('on', t.liked); $('span', b).textContent = fmt(t.likes); }
    else if (a === 'rt') { t.rt = !t.rt; t.rts += t.rt ? 1 : -1; b.classList.toggle('on', t.rt); $('span', b).textContent = fmt(t.rts); }
    else if (a === 'reply') compose(t);
    else toast(a === 'share' ? '링크를 복사했어요' : '조회수는 비공개 데이터예요');
  });

  function compose(replyTo) {
    const inner = sheet.open(`<div class="cp-top"><button class="cancel">취소</button><button class="post-btn">${replyTo ? '답글' : '게시하기'}</button></div>
      <div class="cp-body">${av(me, 'm')}<textarea placeholder="${replyTo ? `@${esc(replyTo.handle)}님에게 답글 달기` : '무슨 일이 일어나고 있나요?'}" maxlength="280"></textarea></div>
      <div class="cp-foot"><span class="cnt">0 / 280</span></div>`, { tall: false });
    const ta = $('textarea', inner), pb = $('.post-btn', inner), cnt = $('.cnt', inner);
    setTimeout(() => ta.focus(), 450);
    ta.addEventListener('input', () => { pb.classList.toggle('on', ta.value.trim().length > 0); cnt.textContent = `${ta.value.length} / 280`; });
    $('.cancel', inner).addEventListener('click', sheet.close);
    pb.addEventListener('click', () => {
      const text = ta.value.trim(); if (!text) return;
      const nt = { id: nextId++, name: me.name, handle: me.handle, avatar: me.avatar, time: '방금', text: (replyTo ? `@${replyTo.handle} ` : '') + text, replies: 0, rts: 0, likes: 0, views: 1, liked: false, rt: false };
      tweets.unshift(nt); if (tab !== 0) { tab = 0; } sheet.close();
      $$('.x-tabs button', el).forEach((b, i) => b.classList.toggle('on', i === tab)); ind.style.transform = `translateX(${tab * 100}%)`;
      render(false); const n = $('.tw', feed); n.classList.add('new'); $('#xScroll', el).scrollTo({ top: 0, behavior: 'smooth' });
      toast(replyTo ? '답글을 게시했어요' : '게시했어요');
    });
  }
  return { back() { return stack.pop(); } };
}

/* ================================================================
   9. 앱: 메시지
   ================================================================ */
function buildMessages(el) {
  const convs = CONFIG.messages.map(c => ({ ...c, msgs: c.msgs.map(m => ({ ...m })), ri: 0 }));
  let active = null;
  const preview = c => { const m = [...c.msgs].reverse().find(x => x.t || x.img); return m ? (m.img && !m.t ? '사진' : m.t) : ''; };
  const sumUnread = () => convs.reduce((a, c) => a + c.unread, 0);
  el.innerHTML = `
    <div class="m-list">
      <div class="navbar" id="mNav"><button class="back-btn" data-back>${I.chev}<span>홈</span></button><div class="nb-title">메시지</div><button class="txt-btn" data-toast="새 메시지는 데모에서 지원하지 않아요">${I.compose.replace('<svg', '<svg width="24" height="24"')}</button></div>
      <div class="scroll" id="mScroll"><h1 class="large-title">메시지</h1>
        <label class="searchbox">${I.search}<input id="mQ" placeholder="검색" autocomplete="off"></label>
        <div id="mRows"></div></div>
    </div>
    <section class="chat" id="chat">
      <div class="navbar solid"><button class="back-btn" data-back>${I.chev}<span id="cBack">메시지</span></button><div class="cn"><span id="cAv"></span><span id="cName"></span></div><span style="width:60px"></span></div>
      <div class="msgs" id="msgs"></div>
      <div class="composer"><button class="cp-plus">${I.plus}</button><div class="cp-in"><input id="cIn" placeholder="iMessage" autocomplete="off"><button class="cp-send" id="cSend">${S('<path d="M12 19V5M5.500 11.500 12 5l6.500 6.500"/>')}</button></div></div>
    </section>`;
  const rows = $('#mRows', el), msgs = $('#msgs', el), chat = $('#chat', el), input = $('#cIn', el), sendBtn = $('#cSend', el);
  bindNav($('#mScroll', el), $('#mNav', el));

  function renderRows(q = '') {
    q = q.trim().toLowerCase();
    rows.innerHTML = convs.filter(c => !q || (c.name + preview(c)).toLowerCase().includes(q)).map(c => `
      <button class="m-row" data-c="${c.id}"><span class="dot ${c.unread ? '' : 'off'}"></span>${av(c)}<div class="mid"><div class="t1"><b>${esc(c.name)}</b><time>${esc(c.time)}${I.chevR.replace('<svg', '<svg width="10" height="12"')}</time></div><p>${esc(preview(c))}</p></div></button>`).join('');
    setBadge('messages', sumUnread());
  }
  renderRows();
  $('#mQ', el).addEventListener('input', e => renderRows(e.target.value));

  const bub = (m, i, arr) => {
    const next = arr[i + 1], tail = !next || !!next.me !== !!m.me;
    if (m.img) return `<div class="bub ${m.me ? 'me' : 'them'} img"><img src="${m.img}" alt=""></div>`;
    return `<div class="bub ${m.me ? 'me' : 'them'} ${tail ? 'tail' : ''}">${esc(m.t)}</div>`;
  };
  function renderChat() {
    const c = active;
    msgs.innerHTML = `<div class="day">오늘 ${clockStr(new Date(Date.now() - 3600e3))}</div>` + c.msgs.map(bub).join('');
    msgs.scrollTop = msgs.scrollHeight;
  }
  function openChat(id) {
    active = convs.find(c => c.id === id); active.unread = 0; renderRows($('#mQ', el).value);
    $('#cAv', el).innerHTML = av(active); $('#cName', el).textContent = active.name; renderChat();
    el.classList.add('chat-on'); chat.classList.add('on');
  }
  function closeChat() { el.classList.remove('chat-on'); chat.classList.remove('on'); input.blur(); active = null; renderRows($('#mQ', el).value); }
  rows.addEventListener('click', e => { const r = e.target.closest('.m-row'); if (r) openChat(r.dataset.c); });
  el.addEventListener('click', e => { const t = e.target.closest('[data-toast]'); if (t) toast(t.dataset.toast); });

  function addBubble(m) {
    const prev = msgs.lastElementChild;
    if (prev && prev.classList.contains('bub') && prev.classList.contains('tail') && !!m.me === prev.classList.contains('me')) prev.classList.remove('tail'), prev.style.marginBottom = '';
    const n = h(bub(m, 0, [m])); msgs.append(n); msgs.scrollTop = msgs.scrollHeight; return n;
  }
  function send() {
    const t = input.value.trim(); if (!t || !active) return;
    const c = active; input.value = ''; sendBtn.classList.remove('on');
    $$('.rcpt', msgs).forEach(x => x.remove());
    const m = { me: 1, t }; c.msgs.push(m); addBubble(m); renderRows($('#mQ', el).value);
    setTimeout(() => {
      if (active !== c) return;
      const ty = h('<div class="typing"><i></i><i></i><i></i></div>'); msgs.append(ty); msgs.scrollTop = msgs.scrollHeight;
      setTimeout(() => {
        ty.remove(); const reply = c.replies[c.ri++ % c.replies.length]; const rm = { t: reply }; c.msgs.push(rm);
        if (active === c) { addBubble(rm); const r = h('<div class="rcpt">읽음</div>'); const mine = $$('.bub.me', msgs).pop(); if (mine) mine.after(r); msgs.scrollTop = msgs.scrollHeight; }
        renderRows($('#mQ', el).value);
      }, 1300 + reply.length * 25);
    }, 600);
  }
  input.addEventListener('input', () => sendBtn.classList.toggle('on', input.value.trim().length > 0));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) send(); });
  sendBtn.addEventListener('click', send);

  return { back() { if (active) { closeChat(); return true; } return false; } };
}

/* ================================================================
   10. 앱: 음악
   ================================================================ */
const music = { built: false };
function buildMusic(el) {
  const S_ = CONFIG.songs, F = CONFIG.musicFeature, stack = makeStack();
  const pl = { i: -1, playing: false, t: 0, vol: .75 }; let audio = null;
  const curSong = () => S_[pl.i];
  el.innerHTML = `
    <div class="navbar" id="muNav"><button class="back-btn" data-back>${I.chev}<span>홈</span></button><div class="nb-title">지금 듣기</div><span style="width:60px"></span></div>
    <div class="scroll" id="muScroll">
      <h1 class="large-title">지금 듣기</h1>
      <button class="mu-feature" data-feat><img class="px" src="${F.cover}" alt=""><div class="tx"><small>${esc(F.tag)}</small><b>${esc(F.title)}</b><span>${esc(F.sub)}</span></div></button>
      <div class="sec-h">최근 재생한 항목</div>
      <div class="mu-rail hscroll">${S_.map((s, i) => `<button class="mu-al" data-i="${i}"><img class="px" src="${s.cover}" alt="" loading="lazy"><b>${esc(s.title)}</b><small>${esc(s.artist)}</small></button>`).join('')}</div>
      <div class="sec-h">노래</div>
      <div>${S_.map((s, i) => `<button class="sg" data-i="${i}"><span class="cv"><img class="px" src="${s.cover}" alt="" loading="lazy"><span class="eqo"><i></i><i></i><i></i></span></span><span class="mid"><span style="min-width:0"><b>${esc(s.title)}</b><small>${esc(s.artist)}</small></span><span class="dur">${mmss(s.dur)}</span></span></button>`).join('')}</div>
    </div>
    <div class="mini" id="mini"><img alt=""><b></b><button data-m="pp"></button><button data-m="next">${I.next}</button></div>
    <div class="np" id="np">
      <div class="np-bg"></div>
      <div class="np-head"><i></i></div>
      <div class="np-art"><img alt=""></div>
      <div class="np-meta"><div style="min-width:0"><b class="np-t"></b><span class="np-a"></span></div><button data-toast="더보기는 데모에서 지원하지 않아요">${I.more}</button></div>
      <div class="np-seek"><div class="slider" id="seek"><i></i></div><div class="np-times"><span id="tCur">0:00</span><span id="tLeft">-0:00</span></div></div>
      <div class="np-ctl"><button data-m="prev">${I.prev}</button><button class="pp" data-m="pp"></button><button data-m="next">${I.next}</button></div>
      <div class="np-vol">${I.volL}<div class="slider" id="vol"><i></i></div>${I.volH}</div>
      <div class="np-foot"><button data-toast="가사는 데모에서 지원하지 않아요">${I.quote}</button><button data-toast="AirPlay는 데모에서 지원하지 않아요">${I.airplay}</button><button data-toast="대기열은 데모에서 지원하지 않아요">${I.list}</button></div>
    </div>`;
  bindNav($('#muScroll', el), $('#muNav', el));
  const mini = $('#mini', el), np = $('#np', el), npBg = $('.np-bg', np);
  const seek = slider($('#seek', el), { onInput: f => { $('#seek', el).style.setProperty('--p', f); pl.t = f * curSong().dur; uiTime(true); }, onCommit: f => { pl.t = f * curSong().dur; if (audio && curSong().audio) audio.currentTime = pl.t; } });
  const vol = slider($('#vol', el), { onInput: f => { pl.vol = f; $('#vol', el).style.setProperty('--p', f); if (audio) audio.volume = f; } });
  $('#vol', el).style.setProperty('--p', pl.vol);

  function uiTime(force) {
    const s = curSong(); if (!s) return;
    if (!seek.drag || force) seek.set(pl.t / s.dur);
    $('#tCur', el).textContent = mmss(pl.t); $('#tLeft', el).textContent = '-' + mmss(s.dur - pl.t);
  }
  function ui() {
    const s = curSong(); if (!s) return;
    mini.classList.add('on'); mini.classList.toggle('pz', !pl.playing);
    $('img', mini).src = s.cover; $('b', mini).textContent = s.title;
    $$('[data-m="pp"]', el).forEach(b => b.innerHTML = pl.playing ? I.pause : I.play);
    $('.np-art img', np).src = s.cover; $('.np-t', np).textContent = s.title; $('.np-a', np).textContent = s.artist;
    npBg.style.backgroundImage = `url('${s.cover}')`; np.classList.toggle('playing', pl.playing);
    el.classList.toggle('paused', !pl.playing);
    $$('.sg', el).forEach(r => r.classList.toggle('cur', +r.dataset.i === pl.i));
    $('#muScroll', el).style.paddingBottom = `calc(var(--hb) + 90px)`;
    $('#iArt').style.backgroundImage = `url('${s.cover}')`; island.classList.add('active'); island.classList.toggle('playing', pl.playing);
    uiTime();
  }
  function load(i) {
    pl.i = i; pl.t = 0; const s = S_[i];
    if (s.audio) { audio = audio || new Audio(); audio.src = s.audio; audio.volume = pl.vol; audio.onloadedmetadata = () => { if (isFinite(audio.duration)) { s.dur = audio.duration; ui(); } }; audio.onended = next; }
    else if (audio) audio.pause();
  }
  function setPlaying(on) { pl.playing = on; const s = curSong(); if (s && s.audio && audio) { on ? audio.play().catch(() => {}) : audio.pause(); } ui(); }
  function playI(i) { load(i); setPlaying(true); }
  function next() { playI((pl.i + 1) % S_.length); }
  function prev() { if (pl.t > 3) { pl.t = 0; if (audio && curSong().audio) audio.currentTime = 0; uiTime(true); } else playI((pl.i - 1 + S_.length) % S_.length); }
  setInterval(() => {
    if (!pl.playing) return; const s = curSong();
    if (s.audio && audio) pl.t = audio.currentTime; else { pl.t += .25; if (pl.t >= s.dur) return next(); }
    uiTime();
  }, 250);

  function openNP() { np.classList.add('on'); setTheme('light'); stack.push(closeNP); }
  function closeNP() { stack.remove(closeNP); np.classList.remove('on'); setTheme('dark'); }

  el.addEventListener('click', e => {
    const tt = e.target.closest('[data-toast]'); if (tt) return toast(tt.dataset.toast);
    const m = e.target.closest('[data-m]');
    if (m) { e.stopPropagation(); const a = m.dataset.m; if (a === 'pp') { if (pl.i < 0) playI(0); else setPlaying(!pl.playing); } else if (a === 'next') next(); else if (a === 'prev') prev(); return; }
    if (e.target.closest('[data-feat]')) return playI(0);
    const r = e.target.closest('[data-i]'); if (r) return playI(+r.dataset.i);
    if (e.target.closest('#mini')) openNP();
  });
  // 전체 플레이어 아래로 끌어서 닫기
  let nd = null;
  $('.np-head', np).addEventListener('pointerdown', e => { nd = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); np.style.transition = 'none'; });
  $('.np-head', np).addEventListener('pointermove', e => { if (nd == null) return; np.style.transform = `translateY(${Math.max(0, (e.clientY - nd) / getScale())}px)`; });
  const ndEnd = e => { if (nd == null) return; const dy = (e.clientY - nd) / getScale(); nd = null; np.style.transition = ''; np.style.transform = ''; if (dy > 100) closeNP(); };
  $('.np-head', np).addEventListener('pointerup', ndEnd); $('.np-head', np).addEventListener('pointercancel', ndEnd);
  return { back() { return stack.pop(); } };
}

/* ================================================================
   11. 앱: 메모
   ================================================================ */
function buildNotes(el) {
  const notes = CONFIG.notes.map((n, i) => ({ ...n, id: i, date: daysAgo(n.days, 15 - (i % 5), (i * 11) % 60), check: n.check ? n.check.map(c => ({ ...c })) : null }));
  let nextId = notes.length, curN = null;
  const nDate = n => n.days === 0 ? clockStr(n.date) : dateStr(n.date);
  const bodyOf = n => n.check ? n.check.map(c => c.t).join(', ') : (n.body || '').split('\n').filter(Boolean).slice(0, 2).join(' ');
  el.classList.add('has-tab');
  el.innerHTML = `
    <div class="n-listwrap">
      <div class="navbar" id="nNav"><button class="back-btn" data-back>${I.chev}<span>홈</span></button><div class="nb-title">메모</div><button class="txt-btn" data-toast="편집 모드는 데모에서 지원하지 않아요">편집</button></div>
      <div class="scroll" id="nScroll"><h1 class="large-title">메모</h1>
        <label class="searchbox">${I.search}<input id="nQ" placeholder="검색" autocomplete="off"></label>
        <div id="nList"></div></div>
      <div class="n-bar"><span style="width:34px"></span><span id="nCnt"></span><button id="nNew">${I.compose}</button></div>
    </div>
    <section class="n-view" id="nView">
      <div class="navbar"><button class="back-btn" data-back>${I.chev}<span>메모</span></button><div class="nb-r"><button data-toast="공유는 데모에서 지원하지 않아요">${I.share}</button><button data-toast="더보기는 데모에서 지원하지 않아요">${I.more}</button></div></div>
      <div class="n-ed" id="nEd"></div>
      <div class="n-bar" style="justify-content:space-around"><button data-toast="체크리스트로 변환은 데모에서 지원하지 않아요">${S('<circle cx="12" cy="12" r="8.500"/><path d="m8.500 12 2.500 2.500 4.500-5"/>')}</button><button id="nDel">${I.trash}</button><button id="nNew2">${I.compose}</button></div>
    </section>`;
  bindNav($('#nScroll', el), $('#nNav', el));
  const list = $('#nList', el), view = $('#nView', el), ed = $('#nEd', el);

  function renderList(q = '') {
    q = q.trim().toLowerCase();
    const f = notes.filter(n => !q || (n.title + bodyOf(n)).toLowerCase().includes(q));
    const groups = [['고정됨', f.filter(n => n.pinned)], ['지난 7일', f.filter(n => !n.pinned && n.days <= 7)], ['지난 30일', f.filter(n => !n.pinned && n.days > 7)]];
    list.innerHTML = groups.filter(g => g[1].length).map(([t, arr]) => `<div class="n-sec">${t}</div><div class="n-grp">${arr.map(n => `<button class="n-row" data-n="${n.id}"><div class="tx"><b>${esc(n.title || '새로운 메모')}</b><p><em>${esc(nDate(n))}</em>${esc(bodyOf(n) || '추가 텍스트 없음')}</p></div>${n.thumb ? `<img class="px" src="${n.thumb}" alt="" loading="lazy">` : ''}</button>`).join('')}</div>`).join('') || `<div class="empty">${I.search}결과 없음</div>`;
    $('#nCnt', el).textContent = `${notes.length}개의 메모`;
  }
  renderList();
  $('#nQ', el).addEventListener('input', e => renderList(e.target.value));

  function openNote(n) {
    curN = n;
    ed.innerHTML = `<div class="n-date">${n.date.getFullYear()}년 ${dateStr(n.date)} ${clockStr(n.date)}</div><input class="n-title" placeholder="제목" value="${esc(n.title)}">` +
      (n.check ? `<div id="ck">${n.check.map((c, i) => ckHTML(c, i)).join('')}</div>` : `<div class="n-body" contenteditable="true" data-ph="메모 입력"></div>`);
    const body = $('.n-body', ed); if (body) body.innerText = n.body || '';
    ed.scrollTop = 0; view.classList.add('on'); el.classList.add('nv-on');
  }
  const ckHTML = (c, i) => `<div class="ck ${c.d ? 'done' : ''}" data-k="${i}"><button class="ck-c">${I.check}</button><span contenteditable="true">${esc(c.t)}</span></div>`;
  function closeNote() { view.classList.remove('on'); el.classList.remove('nv-on'); if (document.activeElement) document.activeElement.blur(); curN = null; renderList($('#nQ', el).value); }
  function newNote() {
    const n = { id: nextId++, title: '', body: '', days: 0, date: new Date(), pinned: false }; notes.unshift(n); renderList(); openNote(n);
    setTimeout(() => $('.n-title', ed).focus(), 500);
  }
  list.addEventListener('click', e => { const r = e.target.closest('.n-row'); if (r) openNote(notes.find(n => n.id === +r.dataset.n)); });
  $('#nNew', el).addEventListener('click', newNote); $('#nNew2', el).addEventListener('click', newNote);
  $('#nDel', el).addEventListener('click', () => { if (!curN) return; const i = notes.indexOf(curN); notes.splice(i, 1); closeNote(); toast('메모를 삭제했어요'); });
  el.addEventListener('click', e => { const t = e.target.closest('[data-toast]'); if (t) toast(t.dataset.toast); });
  ed.addEventListener('input', e => {
    if (!curN) return;
    if (e.target.classList.contains('n-title')) curN.title = e.target.value;
    else if (e.target.classList.contains('n-body')) curN.body = e.target.innerText;
    else if (e.target.closest('.ck')) { const k = +e.target.closest('.ck').dataset.k; curN.check[k].t = e.target.textContent; }
  });
  ed.addEventListener('click', e => {
    const c = e.target.closest('.ck-c'); if (!c || !curN) return; const row = c.closest('.ck'), k = +row.dataset.k;
    curN.check[k].d = !curN.check[k].d; row.classList.toggle('done', curN.check[k].d);
  });
  ed.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !curN || !curN.check || !e.target.closest('.ck') || e.isComposing) return;
    e.preventDefault(); const row = e.target.closest('.ck'), k = +row.dataset.k;
    curN.check.splice(k + 1, 0, { t: '', d: false }); $('#ck', ed).innerHTML = curN.check.map(ckHTML).join('');
    const nr = $$('.ck', ed)[k + 1]; nr.classList.add('new'); $('span', nr).focus();
  });
  return { back() { if (curN) { closeNote(); return true; } return false; } };
}

/* ================================================================
   12. 캘린더
   ================================================================ */

function buildCalendar(el) {
  const MIN_YEAR = 2026;
  const MAX_YEAR = 2028;

  // 고정 일정
  const events = {
    '2026-10-07': ['KO1KEYZ 데뷔일'],
    '2027-10-07': ['KO1KEYZ 1주년'],
    '2028-10-07': ['KO1KEYZ 2주년'],
    '2026-11-07': ['한국 팬미팅'],
    '2026-11-08': ['한국 팬미팅'],
  };

  const keyOf = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const today = new Date();
  let year = Math.min(MAX_YEAR, Math.max(MIN_YEAR, today.getFullYear()));
  let month = today.getFullYear() >= MIN_YEAR && today.getFullYear() <= MAX_YEAR
    ? today.getMonth() : 0;
  let selected = keyOf(year, month, today.getFullYear() >= MIN_YEAR && today.getFullYear() <= MAX_YEAR
    ? today.getDate() : 1);

  // 매년 5월 6일 생일 일정
  function getEvents(y, m, d) {
    const key = keyOf(y, m, d);
    const result = [...(events[key] || [])];
    if (m === 4 && d === 6) result.unshift('내 생일 🎂');
    return result;
  }

  el.innerHTML = `
    <div class="cal-wrap">
      <div class="navbar cal-navbar">
        <button class="back-btn" data-back>${I.chev}<span>홈</span></button>
        <div class="nb-title">캘린더</div>
        <span class="cal-nav-space"></span>
      </div>

      <div class="cal-scroll" id="calScroll">
        <div class="cal-monthbar">
          <h1 id="calMonthTitle"></h1>
          <div class="cal-month-buttons">
          <button id="calPrev" aria-label="이전 달">〈 이전</button>
          <button id="calNext" aria-label="다음 달">다음 〉</button>
        </div>
        </div>

        <div class="cal-weekdays">
          <span>일</span><span>월</span><span>화</span>
          <span>수</span><span>목</span><span>금</span><span>토</span>
        </div>

        <div class="cal-grid" id="calGrid"></div>

        <div class="cal-agenda">
          <h2 id="calSelectedTitle"></h2>
          <div id="calEventList"></div>
        </div>
      </div>
    </div>
  `;

  const grid = $('#calGrid', el);
  const monthTitle = $('#calMonthTitle', el);
  const selectedTitle = $('#calSelectedTitle', el);
  const eventList = $('#calEventList', el);
  const prevBtn = $('#calPrev', el);
  const nextBtn = $('#calNext', el);

  function renderAgenda() {
    const [y, m, d] = selected.split('-').map(Number);
    selectedTitle.textContent = `${m}월 ${d}일`;
    const items = getEvents(y, m - 1, d);

    eventList.innerHTML = items.length
      ? items.map(item => `<div class="cal-event">
          <span class="cal-event-dot"></span>
          <span>${esc(item)}</span>
        </div>`).join('')
      : `<div class="cal-empty">등록된 일정이 없어요.</div>`;
  }

  function renderCalendar() {
    monthTitle.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push('<div class="cal-day cal-blank"></div>');
    }

    for (let day = 1; day <= lastDate; day++) {
      const key = keyOf(year, month, day);
      const hasEvent = getEvents(year, month, day).length > 0;
      const isSelected = key === selected;
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate();

      cells.push(`
        <button class="cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
          data-date="${key}">
          <span class="cal-day-number">${day}</span>
          ${hasEvent ? '<span class="cal-dot"></span>' : ''}
        </button>
      `);
    }

    grid.innerHTML = cells.join('');

    prevBtn.disabled = year === MIN_YEAR && month === 0;
    nextBtn.disabled = year === MAX_YEAR && month === 11;

    renderAgenda();
  }

  function changeMonth(amount) {
    month += amount;
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }

    // 월을 바꾸면 해당 월 1일을 선택
    selected = keyOf(year, month, 1);
    renderCalendar();
  }

  grid.addEventListener('click', e => {
    const dayBtn = e.target.closest('[data-date]');
    if (!dayBtn) return;
    selected = dayBtn.dataset.date;
    renderCalendar();
  });

  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));

  bindNav($('#calScroll', el), $('.cal-navbar', el));
  renderCalendar();
}

/* ================================================================
   13. 전화
   ================================================================ */


function buildPhone(el) {
  let number = '';
  let isCalling = false;

  const callMessage = '여보세요? KOILY, 나야. 전화했어? 무슨 일이야?';

  el.innerHTML = `
    <div class="ph-wrap">
      <div class="navbar ph-navbar" id="phNav">
        <button class="back-btn" data-back>${I.chev}<span>홈</span></button>
        <div class="nb-title">전화</div>
        <span class="ph-nav-space"></span>
      </div>

      <div class="ph-main" id="phMain">

        <div class="ph-keypad-page" id="phKeypadPage">
          <div class="ph-heading">키패드</div>

          <div class="ph-number-area">
            <div class="ph-number" id="phNumber"></div>
          </div>

          <div class="ph-keypad">
            ${[
              ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
              ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
              ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
              ['*', ''], ['0', '+'], ['#', '']
            ].map(([n, sub]) => `
              <button class="ph-key" data-key="${n}">
                <strong>${n}</strong>
                ${sub ? `<small>${sub}</small>` : ''}
              </button>
            `).join('')}
          </div>

          <div class="ph-call-row">
            <span></span>
            <button class="ph-call-btn" id="phCall" aria-label="전화 걸기">☎</button>
            <button class="ph-delete" id="phDelete">⌫</button>
          </div>
        </div>

        <div class="ph-call-page" id="phCallPage">
          <div class="ph-call-info">
            <div class="ph-call-avatar">K</div>
            <h2>KOILY</h2>
            <p id="phCallStatus">연결 중...</p>
            <span id="phCallNumber"></span>
          </div>

          <div class="ph-call-actions">
            <button class="ph-end-btn" id="phEnd">☎</button>
            <span>통화 종료</span>
          </div>
        </div>

      </div>

      <div class="ph-tabs">
        <div class="ph-tab"><span>★</span>즐겨찾기</div>
        <div class="ph-tab"><span>◷</span>최근 통화</div>
        <div class="ph-tab"><span>♙</span>연락처</div>
        <div class="ph-tab active"><span>▦</span>키패드</div>
        <div class="ph-tab"><span>◉</span>음성 사서함</div>
      </div>
    </div>
  `;

  const numberDisplay = $('#phNumber', el);
  const keypadPage = $('#phKeypadPage', el);
  const callPage = $('#phCallPage', el);
  const callStatus = $('#phCallStatus', el);

  function renderNumber() {
    numberDisplay.textContent = number;
    $('#phCall', el).disabled = !number.length;
    $('#phDelete', el).style.visibility = number ? 'visible' : 'hidden';
  }

  function endCall() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    isCalling = false;
    callPage.classList.remove('on');
    keypadPage.classList.remove('off');
  }

  function makeCall() {
    if (!number || isCalling) return;

    isCalling = true;
    $('#phCallNumber', el).textContent = number;
    callStatus.textContent = '연결되었습니다';
    keypadPage.classList.add('off');
    callPage.classList.add('on');

    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(callMessage);
      speech.lang = 'ko-KR';
      speech.rate = 0.95;
      speech.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(v => v.lang.toLowerCase().startsWith('ko'));
      if (koreanVoice) speech.voice = koreanVoice;

      window.speechSynthesis.speak(speech);
    } else {
      callStatus.textContent = '음성 재생을 지원하지 않는 브라우저예요';
    }
  }

  el.addEventListener('click', e => {
    const key = e.target.closest('[data-key]');
    if (key && !isCalling) {
      if (number.length < 20) {
        number += key.dataset.key;
        renderNumber();
      }
    }
  });

  $('#phDelete', el).addEventListener('click', () => {
    if (isCalling) return;
    number = number.slice(0, -1);
    renderNumber();
  });

  $('#phCall', el).addEventListener('click', makeCall);
  $('#phEnd', el).addEventListener('click', endCall);

  bindNav($('#phMain', el), $('#phNav', el));
  renderNumber();

  return {
    back() {
      if (isCalling) {
        endCall();
        return true;
      }
      return false;
    }
  };
}
/* ==================================================
   YouTube App
   ================================================== */

function buildYoutube(el) {
  const videos = [
    {
      id: '75MEFldsJKc',
      title: "KO1KEYZ(コイキーズ)｜ 'KO1KEYZ' Official MV",
      channel: 'KO1KEYZ 공식'
    },
    {
      id: 'wCp_X6CBQS8',
      title: "KO1KEYZ (コイキーズ)｜'KO1KEYZ' (Korean ver.) Performance Video",
      channel: 'KO1KEYZ 공식'
    },
    {
      id: '3CFZYgkokUQ',
      title: "KO1KEYZ (コイキーズ)｜'KO1KEYZ' (Korean ver.) Cheering Guide",
      channel: 'KO1KEYZ 공식'
    },
    {
      id: 'Nn3j0e43_Rc',
      title: "[입덕직캠] KO1KEYZ 시영 직캠 4K 'KO1KEYZ (Korean ver.)'",
      channel: 'M2'
    },
    {
      id: '3UUgT0HBdvY',
      title: "[MPD직캠] KO1KEYZ 시영 직캠 4K 'KO1KEYZ (Korean ver.)'",
      channel: 'M2'
    },
    {
      id: 'vjuUIr0Yywk',
      title: 'KO1KEYZ - KO1KEYZ (Korean ver.) #엠카운트다운 EP.949',
      channel: 'M2'
    },
    {
      id: 'pYF0vD45b4I',
      title: 'KO1KEYZ (Korean ver.) - KO1KEYZ [뮤직뱅크]',
      channel: 'KBS Kpop'
    },
    {
      id: 'phVbCIGsnqo',
      title: "[K-Choreo 8K] 코이키즈 직캠 'KO1KEYZ (Korean ver.)'",
      channel: 'KBS Kpop'
    },
    {
      id: 'k5x6FbUNsxg',
      title: '[#음중풀캠] KO1KEYZ – KO1KEYZ (Korean ver.) FullCam',
      channel: 'MBCkpop'
    },
    {
      id: 'D6v6QTbEIzU',
      title: "[안방1열 직캠4K] 코이키즈 시영 'KO1KEYZ (Korean ver.)'",
      channel: 'SBSKPOP ZOOM'
    },
    {
      id: 'LaLBFz-gr4M',
      title: "[안방1열 풀캠4K] 코이키즈 'KO1KEYZ (Korean ver.)'",
      channel: 'SBSKPOP ZOOM'
    },
    {
      id: '9eLSS2To61Q',
      title: '[쇼챔직캠 4K] KO1KEYZ SIYOUNG - KO1KEYZ (Korean ver.)',
      channel: 'ALL THE K-POP'
    },
    {
      id: 'sFqEbUG8Cm0',
      title: '[FAN CAM 4K] KO1KEYZ (Korean ver.) - KO1KEYZ [THE SHOW]',
      channel: 'THE K-POP'
    }
  ];

  const channels = [
    { name: 'KO1KEYZ 공식', mark: 'K', color: '#222' },
    { name: 'M2', mark: 'M2', color: '#222' },
    { name: 'KBS Kpop', mark: 'K', color: '#3975bd' },
    { name: 'MBCkpop', mark: 'M', color: '#3975bd' },
    { name: 'SBSKPOP ZOOM', mark: 'S', color: '#333' },
    { name: 'ALL THE K-POP', mark: 'A', color: '#ed4778' },
    { name: 'THE K-POP', mark: 'T', color: '#555' }
  ];

  let currentPage = 'home';
  let selectedChannel = '';
  let searchText = '';
  let searchHistory = ['카피바라', '말차 디저트', '고양이 브이로그'];
  let watched = [];
  let liked = [];

  const thumbnail = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const videoUrl = id => `https://www.youtube.com/watch?v=${id}`;

  function channelInfo(name) {
    return channels.find(c => c.name === name) || channels[0];
  }

  function videoCard(video) {
    const channel = channelInfo(video.channel);
    return `
      <div class="yt-video-card" data-video="${video.id}">
        <img class="yt-thumbnail"
          src="${thumbnail(video.id)}"
          alt=""
          loading="lazy">
        <div class="yt-video-info">
          <div class="yt-channel-mark" style="--channel-color:${channel.color}">
            ${channel.mark}
          </div>
          <div class="yt-video-text">
            <div class="yt-video-title">${esc(video.title)}</div>
            <div class="yt-video-meta">${esc(video.channel)}</div>
          </div>
          <button class="yt-more" data-like="${video.id}" aria-label="좋아요">
            ${liked.includes(video.id) ? '♥' : '♡'}
          </button>
        </div>
      </div>
    `;
  }

  function channelCard(channel) {
    const count = videos.filter(v => v.channel === channel.name).length;
    return `
      <button class="yt-channel-card" data-channel="${esc(channel.name)}">
        <span class="yt-channel-avatar"
          style="--channel-color:${channel.color}">
          ${channel.mark}
        </span>
        <span class="yt-channel-name">${esc(channel.name)}</span>
        <span class="yt-channel-count">동영상 ${count}개</span>
        <span class="yt-channel-arrow">›</span>
      </button>
    `;
  }

  function renderHome() {
    const featured = videos[0];
    return `
      <div class="yt-section-heading">추천 동영상</div>

      <div class="yt-featured" data-video="${featured.id}">
        <img src="${thumbnail(featured.id)}" alt="" class="yt-featured-img">
        <div class="yt-featured-info">
          <div class="yt-featured-label">추천 영상</div>
          <div class="yt-featured-title">${esc(featured.title)}</div>
          <div class="yt-video-meta">${esc(featured.channel)}</div>
        </div>
      </div>

      <div class="yt-section-heading">추천 영상</div>
      ${videos.slice(1, 5).map(videoCard).join('')}

      <div class="yt-section-heading">구독 채널</div>
      <div class="yt-channel-list">
        ${channels.slice(0, 4).map(channelCard).join('')}
      </div>
    `;
  }

  function renderSubscriptions() {
    return `
      <div class="yt-page-title">구독</div>
      <div class="yt-sub-description">구독 중인 채널의 새 영상 모아보기</div>
      <div class="yt-channel-list">
        ${channels.map(channelCard).join('')}
      </div>
    `;
  }

  function renderChannel(name) {
    const channel = channelInfo(name);
    const list = videos.filter(v => v.channel === name);

    return `
      <button class="yt-back-channel" data-page="subscriptions">
        ‹ 구독 목록
      </button>

      <div class="yt-channel-header">
        <div class="yt-channel-avatar large"
          style="--channel-color:${channel.color}">
          ${channel.mark}
        </div>
        <div class="yt-channel-header-name">${esc(name)}</div>
        <div class="yt-video-meta">동영상 ${list.length}개</div>
      </div>

      <div class="yt-section-heading">업로드한 동영상</div>
      ${list.map(videoCard).join('')}
    `;
  }

  function renderLibrary() {
    const likedVideos = videos.filter(v => liked.includes(v.id));
    const watchedVideos = watched.map(id => videos.find(v => v.id === id)).filter(Boolean);

    return `
      <div class="yt-page-title">보관함</div>

      <div class="yt-library-heading">좋아요 표시한 동영상</div>
      ${likedVideos.length
        ? likedVideos.map(videoCard).join('')
        : '<div class="yt-empty">아직 좋아요를 누른 영상이 없어!</div>'}

      <div class="yt-library-heading">최근 시청한 동영상</div>
      ${watchedVideos.length
        ? watchedVideos.map(videoCard).join('')
        : '<div class="yt-empty">아직 시청 기록이 없어!</div>'}
    `;
  }

  function renderSearchResults() {
    const result = videos.filter(v =>
      v.title.toLowerCase().includes(searchText.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchText.toLowerCase())
    );

    return `
      <div class="yt-page-title">검색 결과</div>
      <div class="yt-sub-description">‘${esc(searchText)}’ 검색 결과</div>
      ${result.length
        ? result.map(videoCard).join('')
        : '<div class="yt-empty">검색 결과가 없어.</div>'}
    `;
  }

  function render() {
    const content = $('#ytContent', el);
    if (!content) return;

    if (currentPage === 'home') content.innerHTML = renderHome();
    else if (currentPage === 'subscriptions') content.innerHTML = renderSubscriptions();
    else if (currentPage === 'channel') content.innerHTML = renderChannel(selectedChannel);
    else if (currentPage === 'library') content.innerHTML = renderLibrary();
    else if (currentPage === 'search') content.innerHTML = renderSearchResults();

    $$('.yt-tab', el).forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === currentPage ||
        (currentPage === 'channel' && tab.dataset.page === 'subscriptions'));
    });

    $('#ytMain', el).scrollTop = 0;
  }

  el.innerHTML = `
    <div class="yt-wrap">
      <div class="navbar yt-navbar" id="ytNav">
        <button class="back-btn" data-back>${I.chev}<span>홈</span></button>
        <div class="nb-title">YouTube</div>
        <span class="yt-nav-space"></span>
      </div>

      <div class="yt-search-wrap">
  <div class="yt-search-bar">
    <input id="ytSearchInput" type="text" placeholder="YouTube 검색">
    <button id="ytSearchBtn">⌕</button>
  </div>

  <div class="yt-search-history" id="ytSearchHistory">
    <div class="yt-history-title">최근 검색 기록</div>
    <div id="ytSearchHistoryList"></div>
  </div>
</div>

      <div class="yt-main" id="ytMain">
        <div id="ytContent"></div>
      </div>

      <div class="yt-bottom">
        <button class="yt-tab active" data-page="home">
          <span>⌂</span>홈
        </button>
        <button class="yt-tab" data-page="subscriptions">
          <span>▣</span>구독
        </button>
        <button class="yt-tab" data-page="library">
          <span>◷</span>보관함
        </button>
      </div>
    </div>
  `;

 render();
renderSearchHistory();

const searchInput = $('#ytSearchInput', el);
const searchHistoryBox = $('#ytSearchHistory', el);

searchInput.addEventListener('focus', () => {
  renderSearchHistory();
  searchHistoryBox.classList.add('show');
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => {
    searchHistoryBox.classList.remove('show');
  }, 150);
});

el.addEventListener('click', e => {
    const video = e.target.closest('[data-video]');
    const like = e.target.closest('[data-like]');
    const channel = e.target.closest('[data-channel]');
    const tab = e.target.closest('[data-page]');
    const historyItem = e.target.closest('[data-search-history]');

    if (like) {
      e.stopPropagation();
      const id = like.dataset.like;
      liked = liked.includes(id)
        ? liked.filter(v => v !== id)
        : [...liked, id];
      render();
      return;
    }

    if (video) {
      const id = video.dataset.video;
      watched = [id, ...watched.filter(v => v !== id)];
      window.open(videoUrl(id), '_blank', 'noopener');
      return;
    }

    if (channel) {
      selectedChannel = channel.dataset.channel;
      currentPage = 'channel';
      render();
      return;
    }

    if (historyItem) {
  const word = historyItem.dataset.searchHistory;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(word)}`;

  window.open(youtubeUrl, '_blank');
  $('#ytSearchHistory', el).classList.remove('show');
  return;
}

    if (tab) {
      currentPage = tab.dataset.page;
      render();
    }
  });

  function renderSearchHistory() {
  $('#ytSearchHistoryList', el).innerHTML = searchHistory.map(word => `
    <button class="yt-search-history-item"
      data-search-history="${esc(word)}">
      <span>◷</span>
      <span>${esc(word)}</span>
    </button>
  `).join('');
  }


  function runSearch(value) {
    searchText = value.trim();
    if (!searchText) return;

    searchHistory = [searchText, ...searchHistory.filter(v => v !== searchText)].slice(0, 8);
    currentPage = 'search';
    render();
  }

  $('#ytSearchBtn', el).addEventListener('click', () => {
    runSearch($('#ytSearchInput', el).value);
  });

  $('#ytSearchInput', el).addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch(e.target.value);
  });

  bindNav($('#ytMain', el), $('#ytNav', el));

  return {
    back() {
      if (currentPage === 'channel' || currentPage === 'search') {
        currentPage = 'subscriptions';
        render();
        return true;
      }
      return false;
    }
  };
}

/* ================================================================
   20. 앱 등록 / 초기화
   ================================================================ */
// theme: 'dark' = 어두운 글씨(밝은 앱 화면) / 'light' = 흰 글씨(어두운 화면)
const APPS = {
  gallery:   { build: buildGallery,   theme: 'dark' },
  instagram: { build: buildInstagram, theme: 'dark' },
  x:         { build: buildX,         theme: 'dark' },
  messages:  { build: buildMessages,  theme: 'dark' },
  music:     { build: buildMusic,     theme: 'dark' },
  notes:     { build: buildNotes,     theme: 'dark' },
  calendar:  { build: buildCalendar,  theme: 'dark' },
  phone:     { build: buildPhone,    theme: 'dark' },
  youtube: { build: buildYoutube, theme: 'dark' },
};

// 안 읽은 메시지 배지 초기값
setBadge('messages', CONFIG.messages.reduce((a, c) => a + c.unread, 0));
$$('[data-toast]').forEach(b => b.addEventListener('click', () => toast(b.dataset.toast)));

// 뒤로가기(bfcache)로 돌아와도 항상 잠금화면에서 시작
addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
requestAnimationFrame(() => lock.classList.add('show'));
})();