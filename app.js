(() => {
  "use strict";

  const GAMES = {
    colors: {
      title: "알록달록 과일",
      icon: "🍎",
      skill: "색깔을 보고 구별해요",
      insight: "색 이름을 말하기보다 같은 색을 직접 찾아보게 해 주세요.",
      offline: {
        title: "우리 집 색깔 보물찾기",
        text: "“노란색 물건은 어디 있을까?” 하고 함께 찾아보세요.",
      },
      rounds: [
        {
          helper: "색깔을 잘 보고 톡!",
          prompt: "빨간색 과일을 찾아볼까?",
          speech: "빨간색 과일을 찾아볼까?",
          success: "맞아! 빨간 사과를 찾았네!",
          options: [
            { label: "바나나", visual: "🍌", subtitle: "노랑" },
            { label: "사과", visual: "🍎", subtitle: "빨강", correct: true },
            { label: "포도", visual: "🍇", subtitle: "보라" },
          ],
        },
        {
          helper: "색깔을 잘 보고 톡!",
          prompt: "노란색 과일은 어디 있을까?",
          speech: "노란색 과일은 어디 있을까?",
          success: "딩동댕! 노란 바나나야!",
          options: [
            { label: "수박", visual: "🍉", subtitle: "초록" },
            { label: "딸기", visual: "🍓", subtitle: "빨강" },
            { label: "바나나", visual: "🍌", subtitle: "노랑", correct: true },
          ],
        },
        {
          helper: "마지막 색깔이에요",
          prompt: "초록색 과일을 찾아볼까?",
          speech: "초록색 과일을 찾아볼까?",
          success: "초록 사과를 찾았어! 멋지다!",
          options: [
            { label: "초록 사과", visual: "🍏", subtitle: "초록", correct: true },
            { label: "복숭아", visual: "🍑", subtitle: "분홍" },
            { label: "오렌지", visual: "🍊", subtitle: "주황" },
          ],
        },
      ],
    },
    shapes: {
      title: "칙칙폭폭 모양 기차",
      icon: "🔷",
      skill: "동그라미·세모·네모를 구별해요",
      insight: "도형 이름과 함께 “둥글다”, “뾰족하다” 같은 느낌도 말해 보세요.",
      offline: {
        title: "모양 닮은꼴 찾기",
        text: "접시는 동그라미, 창문은 네모! 집 안의 모양을 함께 찾아보세요.",
      },
      rounds: [
        {
          helper: "기차에 모양을 태워요",
          prompt: "동그라미 블록은 어디 있을까?",
          speech: "둥글둥글 동그라미 블록은 어디 있을까?",
          success: "둥글둥글 동그라미, 찾았다!",
          options: shapeOptions("circle"),
        },
        {
          helper: "기차에 모양을 태워요",
          prompt: "뾰족한 세모를 찾아볼까?",
          speech: "뾰족뾰족 세모를 찾아볼까?",
          success: "뾰족한 세모가 기차에 쏙!",
          options: shapeOptions("triangle", ["square", "triangle", "circle"]),
        },
        {
          helper: "마지막 칸이 남았어요",
          prompt: "반듯한 네모는 어디 있을까?",
          speech: "반듯반듯 네모는 어디 있을까?",
          success: "네모까지 모두 탔어. 출발!",
          options: shapeOptions("square", ["triangle", "circle", "square"]),
        },
      ],
    },
    counting: {
      title: "병아리가 몇 마리?",
      icon: "🐤",
      skill: "눈으로 짚으며 1부터 5까지 세요",
      insight: "아이와 함께 하나씩 손가락으로 짚으면 수와 양을 연결하기 쉬워요.",
      offline: {
        title: "간식 하나씩 놓기",
        text: "접시에 간식을 1개, 2개, 3개씩 놓고 함께 소리 내어 세어보세요.",
      },
      rounds: [
        {
          helper: "하나씩 천천히 세어봐요",
          prompt: "병아리가 몇 마리일까?",
          speech: "병아리가 몇 마리일까? 하나씩 세어보자.",
          scene: ["🐤", "🐤"],
          success: "하나, 둘! 두 마리가 맞아!",
          options: numberOptions(2, [1, 2, 3]),
        },
        {
          helper: "손가락으로 짚어도 좋아요",
          prompt: "토끼가 모두 몇 마리일까?",
          speech: "토끼가 모두 몇 마리일까?",
          scene: ["🐰", "🐰", "🐰"],
          success: "하나, 둘, 셋! 세 마리야!",
          options: numberOptions(3, [2, 4, 3]),
        },
        {
          helper: "마지막으로 한 번 더!",
          prompt: "반짝이는 별은 몇 개일까?",
          speech: "반짝이는 별은 몇 개일까? 천천히 세어보자.",
          scene: ["⭐", "⭐", "⭐", "⭐"],
          success: "네 개를 모두 잘 세었어!",
          options: numberOptions(4, [5, 4, 3]),
        },
      ],
    },
    sounds: {
      title: "누구의 소리일까?",
      icon: "♪",
      skill: "익숙한 소리를 듣고 주인을 찾아요",
      insight: "동물 이름만 묻지 말고 소리를 함께 흉내 내며 말놀이로 이어가 보세요.",
      offline: {
        title: "우리 집 소리 탐험",
        text: "문 닫는 소리, 물 흐르는 소리를 듣고 무엇의 소리인지 맞혀보세요.",
      },
      rounds: [
        {
          helper: "귀를 쫑긋, 다시 듣기도 눌러요",
          prompt: "“멍멍!” 누구의 소리일까?",
          speech: "멍멍! 멍멍! 누구의 소리일까?",
          success: "멍멍! 강아지 친구구나!",
          options: [
            { label: "고양이", visual: "🐱", subtitle: "야옹" },
            { label: "강아지", visual: "🐶", subtitle: "멍멍", correct: true },
            { label: "소", visual: "🐮", subtitle: "음메" },
          ],
        },
        {
          helper: "어떤 친구가 떠오르나요?",
          prompt: "“음메~” 누구의 소리일까?",
          speech: "음메에. 누구의 소리일까?",
          success: "그래, 소가 음메 하고 울어!",
          options: [
            { label: "소", visual: "🐮", subtitle: "음메", correct: true },
            { label: "오리", visual: "🦆", subtitle: "꽥꽥" },
            { label: "돼지", visual: "🐷", subtitle: "꿀꿀" },
          ],
        },
        {
          helper: "마지막 소리를 잘 들어요",
          prompt: "“꽥꽥!” 누구의 소리일까?",
          speech: "꽥꽥! 누구의 소리일까?",
          success: "오리가 꽥꽥! 잘 들었어!",
          options: [
            { label: "병아리", visual: "🐤", subtitle: "삐약" },
            { label: "개구리", visual: "🐸", subtitle: "개굴" },
            { label: "오리", visual: "🦆", subtitle: "꽥꽥", correct: true },
          ],
        },
      ],
    },
    words: {
      title: "말 친구를 찾아요",
      icon: "💬",
      skill: "친숙한 낱말을 쓰임에 따라 나눠요",
      insight: "정답 낱말을 “당근을 먹어요”처럼 짧은 문장으로 한 번 더 들려주세요.",
      offline: {
        title: "한 바구니 말놀이",
        text: "집 안 물건을 보며 “먹는 것”, “입는 것”을 한 바구니씩 모아보세요.",
      },
      rounds: [
        {
          helper: "말을 듣고 그림을 골라요",
          prompt: "먹을 수 있는 것을 찾아볼까?",
          speech: "먹을 수 있는 것을 찾아볼까?",
          success: "아삭아삭, 당근은 먹는 것이야!",
          options: [
            { label: "자동차", visual: "🚗", subtitle: "타요" },
            { label: "당근", visual: "🥕", subtitle: "먹어요", correct: true },
            { label: "양말", visual: "🧦", subtitle: "신어요" },
          ],
        },
        {
          helper: "말을 듣고 그림을 골라요",
          prompt: "타고 움직이는 것은 무엇일까?",
          speech: "타고 움직이는 것은 무엇일까?",
          success: "따르릉! 자전거를 타고 가요!",
          options: [
            { label: "바나나", visual: "🍌", subtitle: "먹어요" },
            { label: "모자", visual: "🧢", subtitle: "써요" },
            { label: "자전거", visual: "🚲", subtitle: "타요", correct: true },
          ],
        },
        {
          helper: "마지막 말 친구예요",
          prompt: "머리에 쓰는 것은 무엇일까?",
          speech: "머리에 쓰는 것은 무엇일까?",
          success: "맞아! 모자를 머리에 써요!",
          options: [
            { label: "모자", visual: "🧢", subtitle: "써요", correct: true },
            { label: "비행기", visual: "✈️", subtitle: "타요" },
            { label: "빵", visual: "🍞", subtitle: "먹어요" },
          ],
        },
      ],
    },
    emotions: {
      title: "오늘 마음 얼굴",
      icon: "😊",
      skill: "상황에 어울리는 마음을 알아봐요",
      insight: "정답을 맞히는 것보다 “너는 언제 이런 마음이야?”라고 이야기를 나눠보세요.",
      offline: {
        title: "거울 표정 놀이",
        text: "거울을 보며 기쁜 얼굴, 속상한 얼굴, 놀란 얼굴을 함께 지어보세요.",
      },
      rounds: [
        {
          helper: "이럴 때 어떤 마음일까요?",
          prompt: "친구가 생일 선물을 주었어요!",
          speech: "친구가 생일 선물을 주었어요. 어떤 마음일까?",
          success: "기쁘고 고마운 마음이 들 수 있어!",
          options: emotionOptions("happy", ["surprised", "happy", "sad"]),
        },
        {
          helper: "마음은 모두 소중해요",
          prompt: "먹던 아이스크림이 바닥에 떨어졌어요.",
          speech: "먹던 아이스크림이 바닥에 떨어졌어요. 어떤 마음일까?",
          success: "속상하고 슬픈 마음이 들 수 있어.",
          options: emotionOptions("sad", ["happy", "sad", "surprised"]),
        },
        {
          helper: "마지막 마음을 살펴봐요",
          prompt: "상자에서 장난감이 짠! 나타났어요.",
          speech: "상자에서 장난감이 짠 하고 나타났어요. 어떤 마음일까?",
          success: "와! 깜짝 놀란 마음이구나!",
          options: emotionOptions("surprised", ["sad", "happy", "surprised"]),
        },
      ],
    },
    matching: {
      title: "쌍둥이 그림 찾기",
      icon: "🧩",
      skill: "같은 그림을 자세히 보고 짝지어요",
      insight: "정답 이름을 먼저 알려주기보다 색과 생김새가 같은지 천천히 비교하게 해 주세요.",
      offline: {
        title: "양말 짝꿍 찾기",
        text: "빨래 속에서 색과 무늬가 같은 양말 두 짝을 함께 찾아보세요.",
      },
      rounds: [
        {
          helper: "위 그림과 똑같은 친구를 찾아요",
          prompt: "무당벌레와 똑같은 그림은 어디 있을까?",
          speech: "무당벌레와 똑같은 그림은 어디 있을까?",
          scene: ["🐞"],
          success: "찾았다! 똑같은 무당벌레 짝꿍이야!",
          options: [
            { label: "나비", visual: "🦋", subtitle: "팔랑팔랑" },
            { label: "무당벌레", visual: "🐞", subtitle: "점박이", correct: true },
            { label: "거북이", visual: "🐢", subtitle: "엉금엉금" },
          ],
        },
        {
          helper: "생김새를 자세히 봐요",
          prompt: "고래와 똑같은 그림을 찾아볼까?",
          speech: "고래와 똑같은 그림을 찾아볼까?",
          scene: ["🐳"],
          success: "첨벙! 고래의 쌍둥이 그림을 찾았어!",
          options: [
            { label: "문어", visual: "🐙", subtitle: "다리가 여덟" },
            { label: "게", visual: "🦀", subtitle: "옆으로 총총" },
            { label: "고래", visual: "🐳", subtitle: "물줄기 뿜뿜", correct: true },
          ],
        },
        {
          helper: "마지막 짝꿍이에요",
          prompt: "자전거의 쌍둥이 그림은 무엇일까?",
          speech: "자전거의 쌍둥이 그림은 무엇일까?",
          scene: ["🚲"],
          success: "따르릉! 똑같은 자전거를 잘 찾았어!",
          options: [
            { label: "자전거", visual: "🚲", subtitle: "따르릉", correct: true },
            { label: "자동차", visual: "🚗", subtitle: "부릉부릉" },
            { label: "킥보드", visual: "🛴", subtitle: "씽씽" },
          ],
        },
      ],
    },
    sizes: {
      title: "누가 더 클까?",
      icon: "🐘",
      skill: "익숙한 것의 크고 작음을 비교해요",
      insight: "두 대상을 손으로 가리키며 “이것보다 더 큰 것은?”처럼 비교하는 말을 들려주세요.",
      offline: {
        title: "큰 것부터 줄 세우기",
        text: "큰 인형, 중간 인형, 작은 인형을 크기대로 세워보세요.",
      },
      rounds: [
        {
          helper: "세 동물을 작은 순서부터 놓아요",
          prompt: "개미, 토끼, 코끼리를 작은 동물부터 차례로 놓아볼까?",
          speech: "개미, 토끼, 코끼리를 작은 동물부터 차례로 놓아 보자.",
          success: "쿵쿵! 코끼리가 가장 커!",
          options: [
            { label: "토끼", visual: "🐇", subtitle: "깡충깡충", sizeRank: 1 },
            { label: "코끼리", visual: "🐘", subtitle: "쿵쿵", sizeRank: 2, correct: true },
            { label: "개미", visual: "🐜", subtitle: "종종종", sizeRank: 0 },
          ],
        },
        {
          helper: "세 과일을 작은 순서부터 놓아요",
          prompt: "딸기, 사과, 수박을 작은 과일부터 차례로 놓아볼까?",
          speech: "딸기, 사과, 수박을 작은 과일부터 차례로 놓아 보자.",
          success: "맞아! 셋 중에는 딸기가 가장 작아!",
          options: [
            { label: "수박", visual: "🍉", subtitle: "초록 줄무늬", sizeRank: 2 },
            { label: "딸기", visual: "🍓", subtitle: "새콤달콤", sizeRank: 0, correct: true },
            { label: "사과", visual: "🍎", subtitle: "아삭아삭", sizeRank: 1 },
          ],
        },
        {
          helper: "세 탈것을 작은 순서부터 놓아요",
          prompt: "킥보드, 자전거, 버스를 작은 탈것부터 차례로 놓아볼까?",
          speech: "킥보드, 자전거, 버스를 작은 탈것부터 차례로 놓아 보자.",
          success: "부웅! 많은 사람이 타는 버스가 가장 커!",
          options: [
            { label: "킥보드", visual: "🛴", subtitle: "씽씽", sizeRank: 0 },
            { label: "자전거", visual: "🚲", subtitle: "따르릉", sizeRank: 1 },
            { label: "버스", visual: "🚌", subtitle: "부웅", sizeRank: 2, correct: true },
          ],
        },
      ],
    },
    patterns: {
      title: "다음 친구는 누구?",
      icon: "🔁",
      skill: "두 친구가 번갈아 나오는 규칙을 찾아요",
      insight: "그림을 가리키며 “사과, 바나나, 사과…”처럼 리듬을 넣어 함께 말해 보세요.",
      offline: {
        title: "블록 번갈아 놓기",
        text: "빨강 블록과 파랑 블록을 하나씩 번갈아 놓아보세요.",
      },
      rounds: [
        {
          helper: "차례대로 소리 내어 말해요",
          prompt: "사과, 바나나, 사과 다음에는 무엇이 올까?",
          speech: "사과, 바나나, 사과. 다음에는 무엇이 올까?",
          scene: ["🍎", "🍌", "🍎", "❓"],
          success: "바나나가 쏙! 번갈아 나오는 규칙을 찾았어!",
          options: [
            { label: "포도", visual: "🍇" },
            { label: "바나나", visual: "🍌", correct: true },
            { label: "사과", visual: "🍎" },
          ],
        },
        {
          helper: "색깔이 어떻게 반복되는지 봐요",
          prompt: "파랑, 노랑, 파랑 다음에는 어떤 색일까?",
          speech: "파란 동그라미, 노란 동그라미, 파란 동그라미. 다음에는 어떤 색일까?",
          scene: ["🔵", "🟡", "🔵", "❓"],
          success: "노란 동그라미야! 파랑과 노랑이 번갈아 나와!",
          options: [
            { label: "노랑", visual: "🟡", correct: true },
            { label: "빨강", visual: "🔴" },
            { label: "파랑", visual: "🔵" },
          ],
        },
        {
          helper: "마지막 규칙을 찾아요",
          prompt: "토끼, 곰, 토끼 다음에는 누가 올까?",
          speech: "토끼, 곰, 토끼. 다음에는 누가 올까?",
          scene: ["🐰", "🐻", "🐰", "❓"],
          success: "곰이 왔네! 토끼와 곰이 사이좋게 번갈아 나와!",
          options: [
            { label: "토끼", visual: "🐰" },
            { label: "강아지", visual: "🐶" },
            { label: "곰", visual: "🐻", correct: true },
          ],
        },
      ],
    },
    more: {
      title: "더 많은 바구니",
      icon: "🍓",
      skill: "1부터 4까지 세고 더 많은 양을 찾아요",
      insight: "두 묶음을 각각 손가락으로 짚어 센 뒤 어느 쪽이 더 많은지 비교해 보세요.",
      offline: {
        title: "두 접시 간식 비교",
        text: "두 접시에 간식을 다르게 놓고 어느 접시에 더 많은지 찾아보세요.",
      },
      rounds: [
        {
          helper: "두 묶음을 하나씩 세어봐요",
          prompt: "더 많은 딸기 묶음에는 몇 개가 있을까?",
          speech: "두 딸기 묶음을 세어 보자. 더 많은 묶음에는 몇 개가 있을까?",
          scene: ["🍓🍓", "🍓🍓🍓"],
          success: "세 개가 두 개보다 더 많아!",
          options: [
            { label: "2", visual: "2", type: "number" },
            { label: "3", visual: "3", type: "number", correct: true },
            { label: "1", visual: "1", type: "number" },
          ],
        },
        {
          helper: "어느 묶음이 더 많은지 비교해요",
          prompt: "더 많은 자동차 묶음에는 몇 대가 있을까?",
          speech: "두 자동차 묶음을 세어 보자. 더 많은 묶음에는 몇 대가 있을까?",
          scene: ["🚗🚗🚗🚗", "🚗🚗"],
          success: "네 대가 두 대보다 더 많아!",
          options: [
            { label: "2", visual: "2", type: "number" },
            { label: "4", visual: "4", type: "number", correct: true },
            { label: "3", visual: "3", type: "number" },
          ],
        },
        {
          helper: "마지막으로 별을 비교해요",
          prompt: "더 많은 별 묶음에는 몇 개가 있을까?",
          speech: "두 별 묶음을 세어 보자. 더 많은 묶음에는 몇 개가 있을까?",
          scene: ["⭐", "⭐⭐⭐"],
          success: "반짝반짝! 세 개가 한 개보다 더 많아!",
          options: [
            { label: "1", visual: "1", type: "number" },
            { label: "2", visual: "2", type: "number" },
            { label: "3", visual: "3", type: "number", correct: true },
          ],
        },
      ],
    },
    routines: {
      title: "척척 생활 대장",
      icon: "🧼",
      skill: "일상 속 건강과 안전 약속을 익혀요",
      insight: "행동을 외우게 하기보다 왜 필요한지 짧은 문장으로 함께 이야기해 주세요.",
      offline: {
        title: "우리 집 순서 카드",
        text: "손 씻기, 밥 먹기처럼 일과를 그림 두 장으로 놓고 순서대로 해보세요.",
      },
      rounds: [
        {
          helper: "먼저 할 일을 골라요",
          prompt: "밖에서 놀고 왔어요. 밥을 먹기 전에 먼저 무엇을 할까?",
          speech: "밖에서 놀고 왔어요. 밥을 먹기 전에 먼저 무엇을 할까?",
          success: "깨끗이 손을 씻고 맛있게 먹어요!",
          options: [
            { label: "텔레비전 보기", visual: "📺", subtitle: "바로 봐요" },
            { label: "손 씻기", visual: "🧼", subtitle: "깨끗이 씻어요", correct: true },
            { label: "사탕 먹기", visual: "🍬", subtitle: "먼저 먹어요" },
          ],
        },
        {
          helper: "몸을 건강하게 지켜요",
          prompt: "이를 튼튼하게 하려면 잠자기 전에 무엇을 할까?",
          speech: "이를 튼튼하게 하려면 잠자기 전에 무엇을 할까?",
          success: "치카치카! 잠들기 전에 이를 닦아요!",
          options: [
            { label: "신발 신기", visual: "👟", subtitle: "밖에 나갈 때" },
            { label: "우산 쓰기", visual: "☂️", subtitle: "비가 올 때" },
            { label: "이 닦기", visual: "🪥", subtitle: "치카치카", correct: true },
          ],
        },
        {
          helper: "길에서는 안전 약속을 지켜요",
          prompt: "길을 건너기 전에는 어떻게 해야 할까?",
          speech: "길을 건너기 전에는 어떻게 해야 할까?",
          success: "멈추고 살핀 뒤, 초록불에 어른 손을 잡고 건너요!",
          options: [
            { label: "어른 손잡기", visual: "🤝", subtitle: "멈춰서 살펴요", correct: true },
            { label: "혼자 뛰기", visual: "🏃", subtitle: "바로 달려요" },
            { label: "길에서 공놀이", visual: "⚽", subtitle: "공을 굴려요" },
          ],
        },
      ],
    },
    body: {
      title: "내 몸은 척척!",
      icon: "👃",
      skill: "몸의 이름과 하는 일을 연결해요",
      insight: "자기 몸을 직접 가리키며 이름과 쓰임을 함께 말해 보게 해 주세요.",
      offline: {
        title: "몸 가리키기 놀이",
        text: "“귀는 어디?”, “발로 쿵!”처럼 말하고 몸을 직접 움직여보세요.",
      },
      rounds: [
        {
          helper: "꽃 냄새를 맡아봐요",
          prompt: "향긋한 꽃 냄새는 몸의 어디로 맡을까?",
          speech: "향긋한 꽃 냄새는 몸의 어디로 맡을까?",
          scene: ["🌸"],
          success: "킁킁! 코로 냄새를 맡아요!",
          options: [
            { label: "눈", visual: "👀", subtitle: "보아요" },
            { label: "코", visual: "👃", subtitle: "냄새를 맡아요", correct: true },
            { label: "귀", visual: "👂", subtitle: "들어요" },
          ],
        },
        {
          helper: "종소리를 잘 들어요",
          prompt: "딩동 종소리는 몸의 어디로 들을까?",
          speech: "딩동 종소리는 몸의 어디로 들을까?",
          scene: ["🔔"],
          success: "귀를 쫑긋! 귀로 소리를 들어요!",
          options: [
            { label: "입", visual: "👄", subtitle: "말하고 먹어요" },
            { label: "손", visual: "✋", subtitle: "잡아요" },
            { label: "귀", visual: "👂", subtitle: "소리를 들어요", correct: true },
          ],
        },
        {
          helper: "몸을 움직여봐요",
          prompt: "공을 톡 하고 차는 데 주로 쓰는 곳은 어디일까?",
          speech: "공을 톡 하고 차는 데 주로 쓰는 곳은 어디일까?",
          scene: ["⚽"],
          success: "맞아! 발로 공을 톡 차요!",
          options: [
            { label: "손", visual: "✋", subtitle: "잡아요" },
            { label: "발", visual: "🦶", subtitle: "걷고 차요", correct: true },
            { label: "배", visual: "👕", subtitle: "몸 가운데" },
          ],
        },
      ],
    },
    ...((window.MONGLE_EXTRA_GAMES && typeof window.MONGLE_EXTRA_GAMES === "object")
      ? window.MONGLE_EXTRA_GAMES
      : {}),
  };

  function shapeOptions(correct, order = ["circle", "square", "triangle"]) {
    const labels = {
      circle: ["동그라미", "둥글둥글"],
      square: ["네모", "반듯반듯"],
      triangle: ["세모", "뾰족뾰족"],
    };
    return order.map((shape) => ({
      label: labels[shape][0],
      subtitle: labels[shape][1],
      type: "shape",
      visual: shape,
      correct: shape === correct,
    }));
  }

  function numberOptions(correct, order) {
    return order.map((number) => ({
      label: `${number}`,
      visual: `${number}`,
      type: "number",
      correct: number === correct,
    }));
  }

  function emotionOptions(correct, order) {
    const emotions = {
      happy: ["기뻐요", "😊", "마음이 활짝"],
      sad: ["슬퍼요", "😢", "마음이 축"],
      surprised: ["놀랐어요", "😮", "눈이 동그래"],
    };
    return order.map((emotion) => ({
      label: emotions[emotion][0],
      visual: emotions[emotion][1],
      subtitle: emotions[emotion][2],
      correct: emotion === correct,
    }));
  }

  const STORAGE_KEY = "mongle-play-progress-v1";
  const SOUND_KEY = "mongle-sound-v1";
  const MUSIC_KEY = "mongle-music-v1";
  const MUSIC_VOLUME_KEY = "mongle-music-volume-v1";
  const playTemplate = document.querySelector("#play-main").innerHTML;

  const shell = document.querySelector("#game-shell");
  const playMain = document.querySelector("#play-main");
  const gameName = document.querySelector("#play-game-name");
  const progressBar = document.querySelector("#play-progress");
  const replayButton = document.querySelector("#replay-instruction");
  const gameMusicToggle = document.querySelector("#game-music-toggle");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundLabel = soundToggle.querySelector(".sound-label");
  const musicToggle = document.querySelector("#music-toggle");
  const musicLabel = musicToggle.querySelector(".music-label");
  const musicVolumeInput = document.querySelector("#music-volume");
  const musicVolumeValue = document.querySelector("#music-volume-value");
  const confetti = document.querySelector("#confetti");
  const parentDialog = document.querySelector("#parent-dialog");
  const toast = document.querySelector("#toast");

  let promptElement;
  let promptHelper;
  let sceneElement;
  let answersElement;
  let feedbackElement;
  let guideCharacter;
  let interactionHintElement;
  let activityAnnouncer;
  let activeActivity = null;
  let roundSettled = false;
  let returnFocusElement = null;
  let roundInstructionToken = 0;
  let activeGameKey = null;
  let roundIndex = 0;
  let wrongAttempts = 0;
  let advanceTimer = null;
  let toastTimer = null;
  let soundEnabled = loadSoundPreference();
  let dailyProgress = loadProgress();
  let audioContext = null;
  let activeUtterance = null;
  let activeVoiceAudio = null;
  let voicePlayToken = 0;
  let speechWarningShown = false;
  let musicEnabled = loadMusicPreference();
  let musicVolume = loadMusicVolume();
  let bgmAudio = null;

  function todayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function blankProgress() {
    return {
      date: todayKey(),
      completed: {},
      attempts: 0,
      lastPlayed: null,
    };
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || saved.date !== todayKey()) return blankProgress();
      return {
        date: saved.date,
        completed: saved.completed || {},
        attempts: Number(saved.attempts) || 0,
        lastPlayed: saved.lastPlayed || null,
      };
    } catch {
      return blankProgress();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyProgress));
    } catch {
      // The games still work when storage is unavailable.
    }
    updateTodayCard();
  }

  function loadSoundPreference() {
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch {
      return true;
    }
  }

  function saveSoundPreference() {
    try {
      localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
    } catch {
      // A preference is optional.
    }
  }

  function loadMusicPreference() {
    try {
      return localStorage.getItem(MUSIC_KEY) !== "off";
    } catch {
      return true;
    }
  }

  function saveMusicPreference() {
    try {
      localStorage.setItem(MUSIC_KEY, musicEnabled ? "on" : "off");
    } catch {
      // A preference is optional.
    }
  }

  function loadMusicVolume() {
    try {
      const raw = localStorage.getItem(MUSIC_VOLUME_KEY);
      if (raw === null) return 0.14;
      const saved = Number(raw);
      return Number.isFinite(saved) && saved >= 0 && saved <= 0.35 ? saved : 0.14;
    } catch {
      return 0.14;
    }
  }

  function saveMusicVolume() {
    try {
      localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
    } catch {
      // A preference is optional.
    }
  }

  function cachePlayElements() {
    promptElement = document.querySelector("#play-prompt");
    promptHelper = document.querySelector("#prompt-helper");
    sceneElement = document.querySelector("#question-scene");
    answersElement = document.querySelector("#answer-grid");
    feedbackElement = document.querySelector("#feedback");
    guideCharacter = playMain.querySelector(".guide-character");
    interactionHintElement = document.querySelector("#interaction-hint");
    activityAnnouncer = document.querySelector("#activity-announcer");
  }

  function restorePlayTemplate() {
    activeActivity?.destroy();
    window.MONGLE_INTERACTIONS?.cleanup();
    activeActivity = null;
    playMain.innerHTML = playTemplate;
    cachePlayElements();
  }

  function completedCount() {
    return Object.values(dailyProgress.completed).filter((count) => count > 0).length;
  }

  function updateTodayCard() {
    const count = completedCount();
    document.querySelectorAll(".stamp").forEach((stamp, index) => {
      stamp.classList.toggle("filled", index < Math.min(count, 3));
    });

    const status = document.querySelector("#today-status");
    if (count === 0) status.textContent = "아직 시작 전이에요";
    else if (count < 3) status.textContent = `${count}개 완료했어요`;
    else status.textContent = "오늘 목표 완료!";
  }

  function updateSoundButton() {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "말소리 켬" : "말소리 끔";
    soundToggle.querySelector(".sound-icon").textContent = soundEnabled ? "♪" : "×";
  }

  function updateMusicControls() {
    musicToggle.setAttribute("aria-pressed", String(musicEnabled));
    musicLabel.textContent = musicEnabled ? "음악 켬" : "음악 끔";
    musicToggle.querySelector(".music-icon").textContent = musicEnabled ? "♫" : "×";
    gameMusicToggle.setAttribute("aria-pressed", String(musicEnabled));
    gameMusicToggle.setAttribute("aria-label", musicEnabled ? "배경음악 끄기" : "배경음악 켜기");
    gameMusicToggle.textContent = musicEnabled ? "♫" : "×";
    const percent = Math.round((musicVolume / 0.35) * 100);
    musicVolumeInput.value = String(percent);
    musicVolumeValue.textContent = String(percent) + "%";
  }

  function playChime(type = "prompt") {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioContext) audioContext = new AudioContextClass();
      const play = () => {
        const frequencies = { start: 659.25, prompt: 739.99, success: 880, retry: 523.25 };
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.prompt, now);
        if (type === "success") oscillator.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.075, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.26);
      };

      if (audioContext.state === "suspended") audioContext.resume().then(play).catch(() => {});
      else play();
    } catch {
      audioContext = null;
    }
  }

  function ensureBgm() {
    if (bgmAudio) return bgmAudio;
    bgmAudio = new Audio("./audio/music/mongle-meadow.mp3");
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = musicVolume;
    return bgmAudio;
  }

  function setBgmDucked(ducked) {
    if (!bgmAudio) return;
    bgmAudio.volume = musicVolume * (ducked ? 0.22 : 1);
  }

  function startBgm() {
    if (!musicEnabled || document.hidden) return;
    const audio = ensureBgm();
    audio.volume = musicVolume;
    audio.play().catch(() => {});
  }

  function stopBgm(reset = false) {
    if (!bgmAudio) return;
    bgmAudio.pause();
    if (reset) bgmAudio.currentTime = 0;
  }

  function stopVoice() {
    voicePlayToken += 1;
    if (activeVoiceAudio) {
      activeVoiceAudio.pause();
      activeVoiceAudio.removeAttribute("src");
      activeVoiceAudio = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    activeUtterance = null;
    setBgmDucked(false);
  }

  function speakWithBrowser(text, onended) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      if (!speechWarningShown) {
        speechWarningShown = true;
        showToast("F1 음성을 불러오지 못했어요. 효과음으로 계속 놀 수 있어요.");
      }
      return false;
    }

    const synth = window.speechSynthesis;
    const token = voicePlayToken;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 0.95;
    const koreanVoice = synth.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith("ko"));
    if (koreanVoice) utterance.voice = koreanVoice;
    activeUtterance = utterance;
    let settled = false;
    const finish = () => {
      if (settled || token !== voicePlayToken) return;
      settled = true;
      if (activeUtterance === utterance) activeUtterance = null;
      setBgmDucked(false);
      onended?.();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    setBgmDucked(true);
    try {
      if (synth.paused) synth.resume();
      synth.speak(utterance);
      return true;
    } catch {
      settled = true;
      if (activeUtterance === utterance) activeUtterance = null;
      setBgmDucked(false);
      return false;
    }
  }

  function speak(text, { onended } = {}) {
    if (!soundEnabled || !text) return false;
    stopVoice();
    const source = window.MONGLE_TTS_AUDIO?.[text];
    if (!source) return speakWithBrowser(text, onended);

    const token = voicePlayToken;
    const audio = new Audio(source);
    activeVoiceAudio = audio;
    audio.preload = "auto";
    audio.volume = 0.98;
    setBgmDucked(true);

    const finish = () => {
      if (token !== voicePlayToken) return;
      activeVoiceAudio = null;
      setBgmDucked(false);
      onended?.();
    };
    audio.onended = finish;
    let failed = false;
    audio.onerror = () => {
      if (failed || token !== voicePlayToken) return;
      failed = true;
      activeVoiceAudio = null;
      setBgmDucked(false);
      if (!speechWarningShown) {
        speechWarningShown = true;
        showToast("F1 음성을 불러오지 못해 기기 음성으로 읽어드려요.");
      }
      const fallbackStarted = speakWithBrowser(text, onended);
      if (!fallbackStarted) window.setTimeout(() => onended?.(), 0);
    };
    audio.play().catch(() => audio.onerror?.());
    return true;
  }

  function currentRound() {
    if (!activeGameKey) return null;
    return GAMES[activeGameKey].rounds[roundIndex];
  }

  function startGame(key) {
    if (!GAMES[key]) return;
    if (!shell.classList.contains("is-open")) {
      returnFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    startBgm();
    playChime("start");
    clearTimeout(advanceTimer);
    activeGameKey = key;
    roundIndex = 0;
    wrongAttempts = 0;
    roundSettled = false;
    restorePlayTemplate();
    replayButton.disabled = false;
    shell.classList.remove("is-closing");
    shell.classList.add("is-open");
    shell.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderRound();
    document.querySelector("#game-close").focus({ preventScroll: true });
  }

  function closeGame() {
    clearTimeout(advanceTimer);
    roundInstructionToken += 1;
    activeActivity?.destroy();
    window.MONGLE_INTERACTIONS?.cleanup();
    activeActivity = null;
    stopVoice();
    stopBgm(true);
    shell.classList.add("is-closing");
    const focusTarget = returnFocusElement;
    window.setTimeout(() => {
      shell.classList.remove("is-open", "is-closing");
      shell.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      activeGameKey = null;
      if (focusTarget?.isConnected && !focusTarget.hidden) {
        focusTarget.focus({ preventScroll: true });
      } else {
        document.querySelector(".game-start:not(.is-hidden), #start-recommended")?.focus({ preventScroll: true });
      }
      returnFocusElement = null;
    }, 190);
  }

  function renderProgress(total, activeIndex) {
    progressBar.innerHTML = "";
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("span");
      dot.className = "progress-dot";
      if (index < activeIndex) dot.classList.add("done");
      if (index === activeIndex) dot.classList.add("current");
      progressBar.appendChild(dot);
    }
    const current = Math.min(activeIndex + 1, total);
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuemin", "1");
    progressBar.setAttribute("aria-valuemax", String(total));
    progressBar.setAttribute("aria-valuenow", String(Math.min(current, total)));
    progressBar.setAttribute("aria-label", total + "문제 중 " + current + "번째");
  }

  function announceActivity(message) {
    if (!activityAnnouncer) return;
    activityAnnouncer.textContent = "";
    window.setTimeout(() => {
      if (activityAnnouncer) activityAnnouncer.textContent = message;
    }, 20);
  }

  function interactionIcon(mode) {
    return {
      count: "●●●",
      compare: "⚖",
      drag: "↘",
      sort: "🧺",
      sequence: "1·2·3",
      memory: "▦",
      pattern: "◆?",
      spot: "⌕",
      trace: "•—•",
      order: "◔",
      draw: "✎",
      choice: "☝",
    }[mode] || "☝";
  }

  function speakRoundInstruction(round) {
    roundInstructionToken += 1;
    speak(round.speech || round.prompt);
  }

  function renderRound() {
    const game = GAMES[activeGameKey];
    const round = currentRound();
    if (!game || !round) return;

    activeActivity?.destroy();
    activeActivity = null;
    roundSettled = false;
    wrongAttempts = 0;
    replayButton.disabled = false;
    guideCharacter.classList.remove("celebrate");
    gameName.textContent = game.title;
    promptHelper.textContent = round.helper;
    promptElement.textContent = round.prompt;
    promptElement.tabIndex = -1;
    feedbackElement.textContent = "";
    feedbackElement.className = "feedback";
    renderProgress(game.rounds.length, roundIndex);

    const engine = window.MONGLE_INTERACTIONS;
    const mode = engine?.resolveMode(activeGameKey, game, round) || "choice";
    const modeMeta = engine?.metaFor(mode, activeGameKey) || { label: "골라 보기", instruction: "알맞은 그림을 골라요." };
    interactionHintElement.textContent = modeMeta.label + " · " + modeMeta.instruction;
    interactionHintElement.dataset.icon = interactionIcon(mode);
    const ownsScene = ["count", "compare", "memory", "pattern", "spot", "trace", "order", "sequence", "draw"].includes(mode);
    renderScene(ownsScene ? [] : round.scene);

    if (!engine || mode === "choice") {
      answersElement.className = "answer-grid";
      renderAnswers(round.options);
    } else {
      activeActivity = engine.render({
        stage: answersElement,
        game,
        round,
        gameKey: activeGameKey,
        roundIndex,
        onAttempt: recordAttempt,
        onComplete: completeCurrentRound,
        onMistake: reportRoundMistake,
        onProgress: playChime,
        announce: announceActivity,
      });
    }

    speakRoundInstruction(round);
    window.setTimeout(() => {
      answersElement.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
    }, 80);
  }

  function renderScene(items) {
    sceneElement.innerHTML = "";
    if (!items || !items.length) {
      sceneElement.hidden = true;
      return;
    }

    sceneElement.hidden = false;
    items.forEach((item, index) => {
      const span = document.createElement("span");
      span.className = "scene-item";
      span.textContent = item;
      span.setAttribute("aria-hidden", "true");
      span.style.animationDelay = `${index * 70}ms`;
      sceneElement.appendChild(span);
    });
    sceneElement.setAttribute("aria-label", items.join(" "));
  }

  function renderAnswers(options) {
    answersElement.className = "answer-grid";
    answersElement.innerHTML = "";
    options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      if (option.type === "number") button.classList.add("number-answer");
      if (option.type === "shape") button.classList.add("shape-answer");
      button.dataset.index = `${index}`;
      button.setAttribute("aria-label", option.subtitle ? `${option.label}, ${option.subtitle}` : option.label);

      const visual = document.createElement("span");
      visual.className = "answer-visual";
      visual.setAttribute("aria-hidden", "true");
      if (option.type === "shape") {
        const shape = document.createElement("span");
        shape.className = `play-shape play-${option.visual}`;
        visual.appendChild(shape);
      } else {
        visual.textContent = option.visual;
      }

      const label = document.createElement("span");
      label.className = "answer-label";
      label.textContent = option.label;
      button.append(visual, label);

      if (option.subtitle) {
        const subtitle = document.createElement("span");
        subtitle.className = "answer-subtitle";
        subtitle.textContent = option.subtitle;
        button.appendChild(subtitle);
      }

      button.addEventListener("click", () => handleAnswer(option, button));
      answersElement.appendChild(button);
    });
  }

  function recordAttempt() {
    dailyProgress.attempts += 1;
    dailyProgress.lastPlayed = activeGameKey;
    saveProgress();
  }

  function completeCurrentRound(source, { record = true } = {}) {
    const round = currentRound();
    if (!round || roundSettled) return;
    if (record) recordAttempt();
    roundSettled = true;
    roundInstructionToken += 1;
    answersElement.classList.add("is-resolved");
    answersElement.querySelectorAll("button").forEach((control) => {
      control.disabled = true;
      control.classList.remove("hint", "is-hint");
    });
    source?.classList.add("is-correct");
    replayButton.disabled = true;
    feedbackElement.textContent = "★ " + round.success;
    feedbackElement.className = "feedback success";
    guideCharacter.classList.add("celebrate");
    playChime("success");
    let advanced = false;
    const gameKey = activeGameKey;
    const advance = () => {
      if (advanced || activeGameKey !== gameKey) return;
      advanced = true;
      clearTimeout(advanceTimer);
      roundIndex += 1;
      if (roundIndex >= GAMES[gameKey].rounds.length) completeGame();
      else renderRound();
    };
    const spoken = speak(round.success, {
      onended: () => {
        clearTimeout(advanceTimer);
        advanceTimer = window.setTimeout(advance, 280);
      },
    });
    advanceTimer = window.setTimeout(advance, spoken ? 7000 : 1200);
  }

  function reportRoundMistake(source, hintTargets) {
    if (roundSettled) return;
    recordAttempt();
    wrongAttempts += 1;
    source?.classList.remove("try-again");
    if (source) void source.offsetWidth;
    source?.classList.add("try-again");
    feedbackElement.textContent =
      wrongAttempts === 1 ? "괜찮아! 놓인 그림은 그대로 두고 다시 해봐요." : "한 단계만 반짝여 줄게요.";
    feedbackElement.className = "feedback retry";
    playChime("retry");
    speak(wrongAttempts === 1 ? "괜찮아. 다시 한번 찾아볼까?" : "정답 친구가 살짝 움직일 거야.");

    if (wrongAttempts >= 2) {
      if (hintTargets) {
        const targets =
          hintTargets instanceof Element
            ? [hintTargets]
            : Array.from(hintTargets).filter(Boolean);
        targets.forEach((target) => target.classList.add("hint"));
        window.setTimeout(() => targets.forEach((target) => target.classList.remove("hint")), 1200);
      } else {
        activeActivity?.hint();
      }
    }
    window.setTimeout(() => source?.classList.remove("try-again"), 500);
  }

  function handleAnswer(option, button) {
    if (!currentRound() || button.disabled || roundSettled) return;
    if (option.correct) {
      completeCurrentRound(button);
      return;
    }
    const correctIndex = currentRound().options.findIndex((answer) => answer.correct);
    reportRoundMistake(button, answersElement.querySelector('[data-index="' + correctIndex + '"]'));
  }

  function completeGame() {
    roundInstructionToken += 1;
    activeActivity?.destroy();
    activeActivity = null;
    const game = GAMES[activeGameKey];
    dailyProgress.completed[activeGameKey] = (dailyProgress.completed[activeGameKey] || 0) + 1;
    dailyProgress.lastPlayed = activeGameKey;
    saveProgress();
    replayButton.disabled = true;
    renderProgress(game.rounds.length, game.rounds.length);
    progressBar.querySelectorAll(".progress-dot").forEach((dot) => {
      dot.classList.remove("current");
      dot.classList.add("done");
    });

    playMain.innerHTML = `
      <div class="completion-card">
        <div class="completion-sticker" aria-hidden="true">★</div>
        <p class="completion-label">오늘의 별 스티커</p>
        <h2>우와, 다 해냈어!</h2>
        <p>${game.title} 놀이를 끝까지 즐겼어요.<br>이제 잠깐 쉬어도 좋아요.</p>
        <div class="completion-actions">
          <button class="completion-home" type="button">다른 놀이 만나기</button>
          <button class="completion-again" type="button">한 번 더</button>
        </div>
      </div>`;

    playMain.querySelector(".completion-home").addEventListener("click", closeGame);
    playMain.querySelector(".completion-again").addEventListener("click", () => startGame(activeGameKey));
    launchConfetti();
    speak(`우와, 다 해냈어! ${game.title} 놀이 끝!`);
  }

  function launchConfetti() {
    confetti.innerHTML = "";
    const colors = ["#ff8067", "#62c9a6", "#ffd45d", "#75bdf1", "#a48ce7", "#f497b7"];
    for (let index = 0; index < 34; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${3 + Math.random() * 94}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.animationDelay = `${Math.random() * 420}ms`;
      piece.style.animationDuration = `${1500 + Math.random() * 700}ms`;
      piece.style.setProperty("--drift", `${-110 + Math.random() * 220}px`);
      confetti.appendChild(piece);
    }
    window.setTimeout(() => {
      confetti.innerHTML = "";
    }, 2600);
  }

  function recommendedGame() {
    return Object.keys(GAMES).find((key) => !dailyProgress.completed[key]) || "colors";
  }

  function updateParentDashboard() {
    document.querySelector("#parent-completed").textContent = `${completedCount()}`;
    document.querySelector("#parent-answers").textContent = `${dailyProgress.attempts}`;

    const message = document.querySelector("#parent-message");
    const count = completedCount();
    if (count === 0) message.textContent = "첫 놀이를 천천히 시작해 보세요.";
    else if (count < 3) message.textContent = "짧고 즐거운 시도를 이어가고 있어요.";
    else message.textContent = "오늘의 작은 목표를 충분히 만났어요.";

    const insight = dailyProgress.lastPlayed ? GAMES[dailyProgress.lastPlayed] : null;
    document.querySelector("#parent-insight-text").textContent = insight
      ? insight.insight
      : "아이가 어떤 카드에 먼저 관심을 보이는지 살펴봐 주세요.";

    const list = document.querySelector("#parent-game-list");
    list.innerHTML = "";
    Object.entries(GAMES).forEach(([key, game]) => {
      const complete = Boolean(dailyProgress.completed[key]);
      const item = document.createElement("div");
      item.className = "parent-game-item";
      item.innerHTML = `
        <span class="parent-game-icon" aria-hidden="true">${game.icon}</span>
        <span><strong>${game.title}</strong><small>${game.skill}</small></span>
        <span class="game-state ${complete ? "complete" : ""}">${complete ? "만났어요" : "아직이에요"}</span>`;
      list.appendChild(item);
    });

    const offline = insight?.offline || GAMES.colors.offline;
    document.querySelector("#offline-tip-title").textContent = offline.title;
    document.querySelector("#offline-tip-text").textContent = offline.text;
  }

  function openParentDialog() {
    updateParentDashboard();
    if (typeof parentDialog.showModal === "function") parentDialog.showModal();
    else parentDialog.setAttribute("open", "");
  }

  function closeParentDialog() {
    if (typeof parentDialog.close === "function") parentDialog.close();
    else parentDialog.removeAttribute("open");
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  const CATALOG_PAGE_SIZE = 24;
  const CATEGORY_ART = Object.freeze({
    look: "./assets/generated/game-look.webp",
    number: "./assets/generated/game-number.webp",
    word: "./assets/generated/game-word.webp",
    heart: "./assets/generated/game-heart.webp",
  });
  let activeCatalogFilter = "all";
  let catalogSearch = "";
  let catalogVisibleLimit = CATALOG_PAGE_SIZE;

  function renderExtraGameCards() {
    const grid = document.querySelector(".game-grid");
    const fragment = document.createDocumentFragment();
    const entries = Object.entries(GAMES).filter(([key]) => key.startsWith("extra"));

    entries.forEach(([key, game], index) => {
      const article = document.createElement("article");
      article.className = `game-card card-${game.cardColor} generated-game-card`;
      article.dataset.category = game.category;
      article.dataset.search = `
        ${game.title} ${game.description} ${game.skill}
        ${game.rounds.map((round) => round.prompt).join(" ")}
      `.toLocaleLowerCase("ko-KR");

      const preview = game.preview.map((item) => `<span>${item}</span>`).join("");
      article.innerHTML = `
        <div class="card-topline">
          <span class="skill-pill">${game.skill}</span>
          <span class="duration">약 ${game.duration}</span>
        </div>
        <div class="card-visual generated-visual" aria-hidden="true">
          <img class="generated-card-image" src="${CATEGORY_ART[game.category]}" alt="" width="512" height="512" loading="lazy" decoding="async" />
          <div class="generated-preview">${preview}</div>
        </div>
        <span class="game-number-badge" aria-hidden="true">${index + 13}</span>
        <h3>${game.title}</h3>
        <p>${game.description}</p>
        <button class="game-start" type="button" data-game="${key}">
          놀이 시작 <span aria-hidden="true">→</span>
        </button>`;
      fragment.appendChild(article);
    });

    grid.appendChild(fragment);
  }

  function applyCatalogView({ resetLimit = false } = {}) {
    if (resetLimit) catalogVisibleLimit = CATALOG_PAGE_SIZE;
    const cards = [...document.querySelectorAll(".game-card")];
    const matches = cards.filter((card) => {
      const categoryMatches = activeCatalogFilter === "all" || card.dataset.category === activeCatalogFilter;
      const searchable = card.dataset.search || card.textContent.toLocaleLowerCase("ko-KR");
      return categoryMatches && (!catalogSearch || searchable.includes(catalogSearch));
    });
    const visibleSet = new Set(matches.slice(0, catalogVisibleLimit));
    cards.forEach((card) => card.classList.toggle("is-hidden", !visibleSet.has(card)));

    const resultCount = document.querySelector("#game-result-count");
    const visibleCount = document.querySelector("#game-visible-count");
    const loadMore = document.querySelector("#load-more-games");
    resultCount.textContent = String(matches.length);
    visibleCount.textContent = String(Math.min(matches.length, catalogVisibleLimit));
    loadMore.hidden = matches.length <= catalogVisibleLimit;

    let empty = document.querySelector("#catalog-empty");
    if (!matches.length) {
      if (!empty) {
        empty = document.createElement("p");
        empty.id = "catalog-empty";
        empty.className = "catalog-empty";
        empty.textContent = "찾는 놀이가 아직 없어요. 다른 낱말로 찾아볼까요?";
        document.querySelector(".game-grid").appendChild(empty);
      }
      empty.hidden = false;
    } else if (empty) {
      empty.hidden = true;
    }
  }

  renderExtraGameCards();
  applyCatalogView();

  document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => startGame(button.dataset.game));
  });

  document.querySelector("#start-recommended").addEventListener("click", () => startGame(recommendedGame()));
  document.querySelector("#game-close").addEventListener("click", closeGame);

  replayButton.addEventListener("click", () => {
    const round = currentRound();
    if (round) {
      playChime("prompt");
      speakRoundInstruction(round);
      activeActivity?.replay();
    }
  });

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) stopVoice();
    saveSoundPreference();
    updateSoundButton();
    showToast(soundEnabled ? "F1 말소리를 켰어요." : "말소리와 효과음을 껐어요.");
    if (soundEnabled) {
      playChime("start");
      speak("소리를 켰어요.");
    }
  });

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    saveMusicPreference();
    updateMusicControls();
    if (musicEnabled) {
      if (shell.classList.contains("is-open")) startBgm();
      showToast("배경음악을 켰어요.");
    } else {
      stopBgm();
      showToast("배경음악을 껐어요.");
    }
  }

  musicToggle.addEventListener("click", toggleMusic);
  gameMusicToggle.addEventListener("click", toggleMusic);

  musicVolumeInput.addEventListener("input", () => {
    musicVolume = (Number(musicVolumeInput.value) / 100) * 0.35;
    musicVolumeValue.textContent = musicVolumeInput.value + "%";
    saveMusicVolume();
    setBgmDucked(Boolean(activeVoiceAudio || activeUtterance));
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((item) => {
        const active = item === chip;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      activeCatalogFilter = chip.dataset.filter;
      applyCatalogView({ resetLimit: true });
    });
  });

  document.querySelector("#game-search").addEventListener("input", (event) => {
    catalogSearch = event.currentTarget.value.trim().toLocaleLowerCase("ko-KR");
    applyCatalogView({ resetLimit: true });
  });

  document.querySelector("#load-more-games").addEventListener("click", () => {
    catalogVisibleLimit += CATALOG_PAGE_SIZE;
    applyCatalogView();
  });

  const stretchButton = document.querySelector("#stretch-button");
  stretchButton.addEventListener("click", () => {
    const promised = stretchButton.classList.toggle("promised");
    stretchButton.innerHTML = promised
      ? "기지개 완료 <span aria-hidden=\"true\">♥</span>"
      : "기지개 약속 <span aria-hidden=\"true\">♡</span>";
    showToast(promised ? "두 팔을 쭉! 몸도 마음도 시원해요." : "언제든 다시 기지개를 켤 수 있어요.");
  });

  document.querySelector("#parent-open").addEventListener("click", openParentDialog);
  document.querySelector("#parent-close").addEventListener("click", closeParentDialog);
  parentDialog.addEventListener("click", (event) => {
    if (event.target === parentDialog) closeParentDialog();
  });

  document.querySelector("#reset-progress").addEventListener("click", () => {
    if (!window.confirm("오늘의 놀이 기록을 모두 지울까요?")) return;
    dailyProgress = blankProgress();
    saveProgress();
    updateParentDashboard();
    showToast("오늘의 놀이 기록을 지웠어요.");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBgm();
    else if (shell.classList.contains("is-open")) startBgm();
  });

  window.addEventListener("pagehide", () => {
    stopVoice();
    stopBgm();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && shell.classList.contains("is-open")) {
      event.preventDefault();
      closeGame();
    }
  });

  updateTodayCard();
  updateSoundButton();
  updateMusicControls();
  cachePlayElements();
})();
