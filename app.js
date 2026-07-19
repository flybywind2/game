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
  const PROFILE_KEY = "mongle-learner-profile-v2";
  const SOUND_KEY = "mongle-sound-v1";
  const MUSIC_KEY = "mongle-music-v1";
  const MUSIC_VOLUME_KEY = "mongle-music-volume-v1";
  const PLAY_LIMIT_KEY = "mongle-play-limit-v1";
  const GAME_HASH_PREFIX = "#game/";
  const DEFAULT_TITLE = document.title;
  const CATEGORY_NAMES = Object.freeze({
    look: "관찰력",
    number: "수·규칙",
    word: "말·이해",
    heart: "마음·생활",
  });
  const BASE_GAME_CATEGORIES = Object.freeze({
    colors: "look",
    shapes: "look",
    counting: "number",
    sounds: "word",
    words: "word",
    emotions: "heart",
    patterns: "look",
    more: "number",
    matching: "look",
    sizes: "look",
    routines: "heart",
    body: "word",
  });
  const STORY_CHAPTERS = Object.freeze([
    { key: "colors", title: "아침 열매 찾기", subtitle: "색깔 관찰", art: "./assets/generated/story/chapter-01-morning-fruit.webp", intro: "햇살이 비치자 몽글이의 소풍 바구니가 알록달록 빛났어요. 잘 익은 열매를 찾아 아침 준비를 도와줄까요?", mission: "색을 자세히 보고 꼭 맞는 과일을 찾아요." },
    { key: "shapes", title: "모양 기차 출발", subtitle: "손가락 그리기", art: "./assets/generated/story/chapter-02-shape-train.webp", intro: "열매를 싣고 떠날 기차의 표지판이 비어 있어요. 동그라미, 세모, 네모 길을 손가락으로 그려 완성해요.", mission: "모양을 찾은 뒤 굵은 길을 끝까지 따라 그려요." },
    { key: "counting", title: "병아리 다리 건너기", subtitle: "1~5 세기", art: "./assets/generated/story/chapter-03-five-chicks.webp", intro: "기차역 앞에서 병아리들이 차례를 기다려요. 한 마리씩 세어 모두 안전하게 건너게 해 주세요.", mission: "필요한 수만큼 직접 눌러 바구니를 채워요." },
    { key: "sounds", title: "숲속 소리 편지", subtitle: "기억·집중", art: "./assets/generated/story/chapter-04-forest-sounds.webp", intro: "숲에서 멍멍, 음메, 꽥꽥 소리가 들려왔어요. 그림의 자리를 기억해 소리 편지의 주인을 찾아요.", mission: "그림을 기억하고 뒤집힌 카드에서 소리 주인을 찾아요." },
    { key: "words", title: "소풍 가방 꾸리기", subtitle: "낱말 분류", art: "./assets/generated/story/chapter-05-picnic-sorting.webp", intro: "소풍 가방에 먹는 것과 타는 것, 입는 것이 뒤섞였어요. 말의 쓰임을 생각해 두 바구니로 나눠요.", mission: "세 그림을 빠짐없이 알맞은 바구니에 나눠요." },
    { key: "patterns", title: "깃발 규칙 잇기", subtitle: "규칙 완성", art: "./assets/generated/story/chapter-06-flag-pattern.webp", intro: "소풍길의 깃발 두 칸이 바람에 날아갔어요. 반복되는 순서를 살펴보고 빠진 깃발을 되돌려 놓아요.", mission: "규칙을 찾아 비어 있는 두 칸을 모두 채워요." },
    { key: "sizes", title: "동물 친구 줄 세우기", subtitle: "크기 비교", art: "./assets/generated/story/chapter-07-size-lineup.webp", intro: "친구들이 사진을 찍으려고 모였지만 어디에 설지 모르겠대요. 실제 크기를 생각해 차례대로 세워요.", mission: "작은 친구부터 큰 친구까지 순서대로 놓아요." },
    { key: "body", title: "몸 친구 도움 작전", subtitle: "관계 연결", art: "./assets/generated/story/chapter-08-body-mission.webp", intro: "보고, 듣고, 걸으며 숲길을 지나야 해요. 눈과 귀와 발이 어떤 일을 하는지 알맞게 이어 주세요.", mission: "질문 그림과 알맞은 몸 부분을 모두 연결해요." },
    { key: "emotions", title: "친구 마음 안아주기", subtitle: "감정 이해", art: "./assets/generated/story/chapter-09-feelings.webp", intro: "소풍 중 친구의 표정이 자꾸 달라져요. 기쁜지, 슬픈지, 놀랐는지 마음을 살펴 따뜻하게 불러 주세요.", mission: "표정을 기억하고 알맞은 마음 이름을 찾아요." },
    { key: "routines", title: "포근한 하루 마무리", subtitle: "생활 습관", art: "./assets/generated/story/chapter-10-bedtime.webp", intro: "신나게 논 뒤에는 손을 씻고 이를 닦고 잠자리를 준비해요. 몽글이와 하루를 포근하게 마무리해요.", mission: "생활 그림을 살펴 알맞은 곳에 모두 나눠요." },
  ]);
  const STORY_BY_KEY = Object.freeze(Object.fromEntries(STORY_CHAPTERS.map((chapter, index) => [chapter.key, { ...chapter, index }])));
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
  const playTimeChip = document.querySelector("#play-time-chip");
  const confetti = document.querySelector("#confetti");
  const parentDialog = document.querySelector("#parent-dialog");
  const parentGate = document.querySelector("#parent-gate");
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
  let activeStoryMode = false;
  let roundIndex = 0;
  let wrongAttempts = 0;
  let advanceTimer = null;
  let idleHintTimer = null;
  let toastTimer = null;
  let roundHasInteraction = false;
  let roundAssistRecorded = false;
  let soundEnabled = loadSoundPreference();
  let dailyProgress = loadProgress();
  let learnerProfile = loadLearnerProfile();
  let audioContext = null;
  let activeUtterance = null;
  let activeVoiceAudio = null;
  let voicePlayToken = 0;
  let speechWarningShown = false;
  let musicEnabled = loadMusicPreference();
  let musicVolume = loadMusicVolume();
  let bgmAudio = null;
  let bgmGameKey = null;
  let bgmSeekToken = 0;
  let deferredInstallPrompt = null;
  let parentUnlockedUntil = 0;
  let pendingParentAction = null;
  let playLimitMinutes = loadPlayLimit();
  let playExtensionMinutes = 0;
  let playAccumulatedMs = 0;
  let playActiveSince = 0;

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
      hints: 0,
      lastPlayed: null,
      plan: [],
    };
  }

  function safeWholeNumber(value, maximum = 999999) {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) ? Math.min(maximum, Math.max(0, number)) : 0;
  }

  function normalizeDailyProgress(saved) {
    if (!saved || saved.date !== todayKey()) return blankProgress();
    const completed = Object.fromEntries(Object.entries(saved.completed || {})
      .filter(([key, count]) => GAMES[key] && safeWholeNumber(count) > 0)
      .map(([key, count]) => [key, safeWholeNumber(count, 99)]));
    return {
      date: todayKey(),
      completed,
      attempts: safeWholeNumber(saved.attempts),
      hints: safeWholeNumber(saved.hints),
      lastPlayed: GAMES[saved.lastPlayed] ? saved.lastPlayed : null,
      plan: Array.isArray(saved.plan) ? [...new Set(saved.plan.filter((key) => GAMES[key]))].slice(0, 3) : [],
    };
  }

  function loadProgress() {
    try {
      return normalizeDailyProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return blankProgress();
    }
  }

  function persistProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyProgress));
    } catch {
      // The games still work when storage is unavailable.
    }
  }

  function saveProgress() {
    persistProgress();
    updateTodayCard();
  }

  function blankLearnerProfile() {
    return {
      version: 2,
      nickname: "꼬마 탐험가",
      xp: 0,
      completed: {},
      stickers: [],
      totalAttempts: 0,
      totalCorrect: 0,
      totalHints: 0,
      gameStats: {},
      activityDays: {},
      observations: [],
    };
  }

  function normalizeActivityDay(day) {
    const categories = {};
    Object.keys(CATEGORY_NAMES).forEach((category) => {
      const saved = day?.categories?.[category] || {};
      const attempts = safeWholeNumber(saved.attempts);
      categories[category] = {
        attempts,
        correct: Math.min(attempts, safeWholeNumber(saved.correct)),
        hints: safeWholeNumber(saved.hints),
      };
    });
    const attempts = safeWholeNumber(day?.attempts);
    return {
      attempts,
      correct: Math.min(attempts, safeWholeNumber(day?.correct)),
      hints: safeWholeNumber(day?.hints),
      completions: safeWholeNumber(day?.completions, 99),
      completedGames: Array.isArray(day?.completedGames) ? [...new Set(day.completedGames.filter((key) => GAMES[key]))].slice(-20) : [],
      categories,
    };
  }

  function trimActivityDays(days) {
    return Object.fromEntries(Object.entries(days || {})
      .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, 30)
      .map(([date, day]) => [date, normalizeActivityDay(day)]));
  }

  function normalizeLearnerProfile(saved) {
    if (!saved || typeof saved !== "object" || saved.version !== 2) return null;
    const completed = Object.fromEntries(Object.entries(saved.completed || {})
      .filter(([key, count]) => GAMES[key] && safeWholeNumber(count) > 0)
      .map(([key, count]) => [key, safeWholeNumber(count, 999)]));
    const gameStats = {};
    Object.entries(saved.gameStats || {}).forEach(([key, stats]) => {
      if (!GAMES[key] || !stats || typeof stats !== "object") return;
      const attempts = safeWholeNumber(stats.attempts);
      gameStats[key] = {
        attempts,
        correct: Math.min(attempts, safeWholeNumber(stats.correct)),
        hints: safeWholeNumber(stats.hints),
        recent: Array.isArray(stats.recent) ? stats.recent.slice(-8).map(Boolean) : [],
      };
    });
    const totalAttempts = safeWholeNumber(saved.totalAttempts);
    const nickname = typeof saved.nickname === "string" ? saved.nickname.trim().slice(0, 10) : "";
    return {
      ...blankLearnerProfile(),
      nickname: nickname || "꼬마 탐험가",
      xp: safeWholeNumber(saved.xp, 9999999),
      completed,
      stickers: Array.isArray(saved.stickers) ? [...new Set(saved.stickers.filter((key) => GAMES[key]))].slice(0, 101) : [],
      totalAttempts,
      totalCorrect: Math.min(totalAttempts, safeWholeNumber(saved.totalCorrect)),
      totalHints: safeWholeNumber(saved.totalHints),
      gameStats,
      activityDays: trimActivityDays(saved.activityDays),
      observations: Array.isArray(saved.observations) ? saved.observations
        .filter((item) => item && GAMES[item.game] && ["independent", "together", "hard"].includes(item.level) && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
        .filter((item) => item.date >= dateKeyOffset(29))
        .slice(-60)
        .map((item) => ({ date: item.date, game: item.game, level: item.level })) : [],
    };
  }

  function loadLearnerProfile() {
    try {
      return normalizeLearnerProfile(JSON.parse(localStorage.getItem(PROFILE_KEY))) || blankLearnerProfile();
    } catch {
      return blankLearnerProfile();
    }
  }

  function saveLearnerProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(learnerProfile));
    } catch {
      // Long-term progress is optional when storage is unavailable.
    }
    updatePremiumDashboard();
  }

  function gameStat(key) {
    if (!learnerProfile.gameStats[key]) {
      learnerProfile.gameStats[key] = { attempts: 0, correct: 0, hints: 0, recent: [] };
    }
    learnerProfile.gameStats[key].hints = Number(learnerProfile.gameStats[key].hints) || 0;
    return learnerProfile.gameStats[key];
  }

  function activityDay(date = todayKey()) {
    if (!learnerProfile.activityDays) learnerProfile.activityDays = {};
    if (!learnerProfile.activityDays[date]) learnerProfile.activityDays[date] = normalizeActivityDay();
    return learnerProfile.activityDays[date];
  }

  function recordActivity(type, { correct = false, gameKey = activeGameKey } = {}) {
    if (!gameKey || !GAMES[gameKey]) return;
    const day = activityDay();
    const category = gameCategory(gameKey);
    const categoryDay = day.categories[category];
    if (type === "attempt") {
      day.attempts += 1;
      categoryDay.attempts += 1;
      if (correct) {
        day.correct += 1;
        categoryDay.correct += 1;
      }
    } else if (type === "hint") {
      day.hints += 1;
      categoryDay.hints += 1;
    } else if (type === "completion") {
      day.completions += 1;
      if (!day.completedGames.includes(gameKey)) day.completedGames.push(gameKey);
    }
    learnerProfile.activityDays = trimActivityDays(learnerProfile.activityDays);
  }

  function adaptiveLevelForGame(key) {
    const observation = latestObservation(key);
    if (observation?.level === "hard") return "support";
    if (observation?.level === "independent") return "challenge";
    if (observation?.level === "together") return "standard";
    const recent = (learnerProfile.gameStats[key]?.recent || []).slice(-6);
    if (recent.length < 4) return "standard";
    const accuracy = recent.filter(Boolean).length / recent.length;
    if (accuracy >= 0.84) return "challenge";
    if (accuracy <= 0.55) return "support";
    return "standard";
  }

  function latestObservation(key) {
    const observations = learnerProfile?.observations || [];
    for (let index = observations.length - 1; index >= 0; index -= 1) {
      if (observations[index].game === key) return observations[index];
    }
    return null;
  }

  function profileLevel() {
    return Math.floor(Math.max(0, learnerProfile.xp) / 300) + 1;
  }

  function gameCategory(key) {
    return GAMES[key]?.category || BASE_GAME_CATEGORIES[key] || "look";
  }

  function categoryProgress(category) {
    const keys = Object.keys(GAMES).filter((key) => gameCategory(key) === category);
    const completed = keys.filter((key) => learnerProfile.completed[key]).length;
    return { completed, total: keys.length, percent: keys.length ? Math.round((completed / keys.length) * 100) : 0 };
  }

  function categoryAccuracy(category) {
    const stats = Object.entries(learnerProfile.gameStats)
      .filter(([key]) => GAMES[key] && gameCategory(key) === category)
      .map(([, stat]) => stat);
    const attempts = stats.reduce((sum, stat) => sum + (Number(stat.attempts) || 0), 0);
    const correct = stats.reduce((sum, stat) => sum + (Number(stat.correct) || 0), 0);
    return { attempts, correct, percent: attempts ? Math.round((correct / attempts) * 100) : 0 };
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

  function loadPlayLimit() {
    try {
      const value = Number(localStorage.getItem(PLAY_LIMIT_KEY));
      return [0, 5, 10, 15].includes(value) ? value : 10;
    } catch {
      return 10;
    }
  }

  function savePlayLimit() {
    try {
      localStorage.setItem(PLAY_LIMIT_KEY, String(playLimitMinutes));
    } catch {
      // A family preference is optional when storage is unavailable.
    }
  }

  function elapsedPlayMs() {
    return playAccumulatedMs + (playActiveSince ? Math.max(0, Date.now() - playActiveSince) : 0);
  }

  function startPlayClock() {
    if (document.hidden || playActiveSince) return;
    playActiveSince = Date.now();
  }

  function pausePlayClock() {
    if (!playActiveSince) return;
    playAccumulatedMs += Math.max(0, Date.now() - playActiveSince);
    playActiveSince = 0;
  }

  function resetPlayClock() {
    playAccumulatedMs = 0;
    playActiveSince = 0;
    playExtensionMinutes = 0;
  }

  function playLimitReached() {
    if (!playLimitMinutes) return false;
    return elapsedPlayMs() >= (playLimitMinutes + playExtensionMinutes) * 60 * 1000;
  }

  function updatePlayTimeChip() {
    if (!playLimitMinutes) {
      playTimeChip.hidden = true;
      return;
    }
    playTimeChip.hidden = false;
    const total = playLimitMinutes + playExtensionMinutes;
    playTimeChip.textContent = `잎 ${total}분 놀이 약속`;
    playTimeChip.setAttribute("aria-label", `보호자가 정한 놀이 시간 ${total}분`);
  }

  function renderPlayLimitSettings() {
    document.querySelectorAll("[data-play-limit]").forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.playLimit) === playLimitMinutes));
    });
    document.querySelector("#playtime-status").textContent = playLimitMinutes
      ? `${playLimitMinutes}분 뒤 현재 게임을 마치면 눈과 몸을 쉬도록 안내해요.`
      : "시간 알림 없이 보호자가 직접 마무리해요.";
    document.querySelector("#rest-title").textContent = playLimitMinutes
      ? `${playLimitMinutes}분 놀았다면, 눈과 몸도 쭉쭉!`
      : "놀이 뒤에는 눈과 몸도 쭉쭉!";
    updatePlayTimeChip();
  }

  function setPlayLimit(minutes) {
    if (![0, 5, 10, 15].includes(minutes)) return;
    playLimitMinutes = minutes;
    resetPlayClock();
    savePlayLimit();
    renderPlayLimitSettings();
    if (shell.classList.contains("is-open")) startPlayClock();
    showToast(minutes ? `${minutes}분 놀이 약속을 정했어요.` : "놀이 시간 알림을 껐어요.");
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
    answersElement.addEventListener("pointerdown", markRoundInteraction, { passive: true });
    answersElement.addEventListener("click", markRoundInteraction);
    answersElement.addEventListener("keydown", markRoundInteraction);
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

  function dailySeed(value = "") {
    let hash = 2166136261;
    for (const character of todayKey() + value) {
      hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
    }
    return hash >>> 0;
  }

  function ensureDailyPlan() {
    const saved = Array.isArray(dailyProgress.plan)
      ? dailyProgress.plan.filter((key, index, keys) => GAMES[key] && keys.indexOf(key) === index).slice(0, 3)
      : [];
    if (saved.length === 3) return saved;

    const alternatingCategory = dailySeed() % 2 === 0 ? "word" : "heart";
    const categories = ["look", "number", alternatingCategory];
    const rotation = dailySeed("order") % categories.length;
    const orderedCategories = [...categories.slice(rotation), ...categories.slice(0, rotation)];
    const plan = orderedCategories.map((category) => {
      const candidates = Object.keys(GAMES).filter((key) => gameCategory(key) === category);
      candidates.sort((left, right) => {
        const completionGap = (learnerProfile.completed[left] || 0) - (learnerProfile.completed[right] || 0);
        if (completionGap) return completionGap;
        return dailySeed(left) - dailySeed(right) || left.localeCompare(right);
      });
      return candidates[0];
    }).filter(Boolean);
    dailyProgress.plan = plan;
    persistProgress();
    return plan;
  }

  function dailyPlanCompletedCount(plan = ensureDailyPlan()) {
    return plan.filter((key) => Number(dailyProgress.completed[key]) > 0).length;
  }

  function renderDailyPlan(plan) {
    const container = document.querySelector("#daily-plan");
    if (!container) return;
    container.innerHTML = "";
    plan.forEach((key, index) => {
      const game = GAMES[key];
      const category = gameCategory(key);
      const done = Number(dailyProgress.completed[key]) > 0;
      const mode = window.MONGLE_INTERACTIONS?.resolveMode(key) || "choice";
      const modeLabel = window.MONGLE_INTERACTIONS?.metaFor(mode, key)?.label || "놀이";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "daily-plan-item" + (done ? " is-complete" : "");
      button.dataset.dailyGame = key;
      button.dataset.category = category;
      button.setAttribute("aria-label", `${index + 1}번째 오늘 놀이, ${game.title}, ${modeLabel}, ${done ? "완료" : "시작"}`);
      button.innerHTML = `
        <span class="daily-plan-step" aria-hidden="true">${done ? "✓" : index + 1}</span>
        <img src="${CATEGORY_ART[category]}" alt="" width="144" height="108" loading="lazy" decoding="async" />
        <span class="daily-plan-copy">
          <small>${CATEGORY_NAMES[category]} · ${modeLabel}</small>
          <strong>${game.title}</strong>
          <em>${done ? "오늘 완료!" : "약 3분 · 시작하기 →"}</em>
        </span>`;
      button.addEventListener("click", () => startGame(key));
      container.appendChild(button);
    });
  }

  function updateTodayCard() {
    const plan = ensureDailyPlan();
    const count = dailyPlanCompletedCount(plan);
    document.querySelectorAll(".stamp").forEach((stamp, index) => {
      stamp.classList.toggle("filled", index < Math.min(count, 3));
    });

    const status = document.querySelector("#today-status");
    if (count === 0) status.textContent = "첫 코스를 시작해요";
    else if (count < 3) status.textContent = `오늘 코스 ${count} / 3`;
    else status.textContent = "오늘 코스 완료!";
    renderDailyPlan(plan);
  }

  function updatePremiumDashboard() {
    const name = document.querySelector("#explorer-name");
    if (!name) return;
    name.textContent = learnerProfile.nickname || "꼬마 탐험가";
    const level = profileLevel();
    const levelXp = learnerProfile.xp % 300;
    document.querySelector("#explorer-level").textContent = String(level);
    document.querySelector("#explorer-xp").textContent = String(learnerProfile.xp);
    document.querySelector("#explorer-xp-next").textContent = String(levelXp === 0 && learnerProfile.xp > 0 ? 300 : 300 - levelXp);
    document.querySelector("#explorer-xp-bar").style.width = `${Math.round((levelXp / 300) * 100)}%`;

    document.querySelectorAll("[data-world]").forEach((card) => {
      const progress = categoryProgress(card.dataset.world);
      card.querySelector(".world-progress i").style.width = `${progress.percent}%`;
      card.querySelector(".world-progress b").textContent = `${progress.completed}/${progress.total}`;
      card.setAttribute("aria-label", `${CATEGORY_NAMES[card.dataset.world]}, ${progress.total}개 중 ${progress.completed}개 완료`);
    });

    document.querySelector("#sticker-count").textContent = String(learnerProfile.stickers.length);
    const stickerMessage = document.querySelector("#sticker-message");
    if (!learnerProfile.stickers.length) stickerMessage.textContent = "첫 놀이를 끝내고 몽글 스티커를 받아요!";
    else if (learnerProfile.stickers.length < 10) stickerMessage.textContent = "새로운 놀이마다 고유 스티커가 찾아와요.";
    else stickerMessage.textContent = `${learnerProfile.nickname || "꼬마 탐험가"}만의 멋진 모음이 자라고 있어요.`;

    const preview = document.querySelector("#sticker-preview");
    preview.innerHTML = "";
    learnerProfile.stickers.slice(-5).reverse().forEach((key) => {
      const sticker = document.createElement("span");
      sticker.textContent = GAMES[key]?.icon || "★";
      sticker.title = GAMES[key]?.title || "몽글 스티커";
      sticker.setAttribute("aria-label", `${GAMES[key]?.title || "몽글"} 스티커`);
      preview.appendChild(sticker);
    });
    while (preview.children.length < 5) {
      const empty = document.createElement("span");
      empty.className = "empty-sticker";
      empty.textContent = "?";
      empty.setAttribute("aria-hidden", "true");
      preview.appendChild(empty);
    }
    renderStoryJourney();
  }

  function renderStoryJourney() {
    const path = document.querySelector("#story-path");
    if (!path) return;
    const completed = STORY_CHAPTERS.filter((chapter) => learnerProfile.completed[chapter.key]).length;
    const nextIndex = STORY_CHAPTERS.findIndex((chapter) => !learnerProfile.completed[chapter.key]);
    const activeIndex = nextIndex < 0 ? 0 : nextIndex;
    document.querySelector("#story-completed-count").textContent = String(completed);
    path.innerHTML = "";
    STORY_CHAPTERS.forEach((chapter, index) => {
      const done = Boolean(learnerProfile.completed[chapter.key]);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `story-node${done ? " is-complete" : ""}${index === activeIndex ? " is-next" : ""}`;
      button.innerHTML = `
        <span class="story-node-number">${done ? "✓" : index + 1}</span>
        <img class="story-node-art" src="${chapter.art}" alt="" width="320" height="240" loading="lazy" decoding="async" />
        <span><strong>${chapter.title}</strong><small>${chapter.subtitle}</small></span>`;
      button.setAttribute("aria-label", `${index + 1}장 ${chapter.title}, ${done ? "완료" : index === activeIndex ? "다음 이야기" : "시작 가능"}`);
      button.addEventListener("click", () => startGame(chapter.key, { story: true }));
      path.appendChild(button);
    });
    const continueButton = document.querySelector("#story-continue");
    const nextChapter = STORY_CHAPTERS[activeIndex];
    continueButton.querySelector("span").textContent = completed
      ? completed === STORY_CHAPTERS.length ? "이야기 다시 만나기" : `${activeIndex + 1}장 이어 하기`
      : "첫 이야기 시작";
    continueButton.onclick = () => startGame(nextChapter.key, { story: true });
  }

  function updateSoundButton() {
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundLabel.textContent = soundEnabled ? "말소리 켬" : "말소리 끔";
    soundToggle.querySelector(".sound-icon").textContent = soundEnabled ? "♪" : "×";
  }

  function updateMusicControls() {
    const plan = musicPlanForGame(activeGameKey);
    musicToggle.setAttribute("aria-pressed", String(musicEnabled));
    musicLabel.textContent = musicEnabled ? "음악 켬" : "음악 끔";
    musicToggle.querySelector(".music-icon").textContent = musicEnabled ? "♫" : "×";
    gameMusicToggle.setAttribute("aria-pressed", String(musicEnabled));
    gameMusicToggle.setAttribute("aria-label", (musicEnabled ? "배경음악 끄기" : "배경음악 켜기") + ", " + plan.label);
    gameMusicToggle.dataset.musicTheme = plan.theme;
    gameMusicToggle.dataset.musicOffset = plan.offset.toFixed(3);
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
    bgmAudio = new Audio("./audio/music/mongle-meadow.mp3?v=2");
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = musicVolume;
    return bgmAudio;
  }

  const BGM_BAR_SECONDS = (60 / 82) * 4;
  const BGM_PLANS = Object.freeze({
    look: { label: "반짝 오르골", bars: [0, 2, 4, 6] },
    number: { label: "통통 마림바", bars: [8, 10, 12, 14] },
    word: { label: "별빛 벨", bars: [16, 18, 20, 22] },
    heart: { label: "포근 오르골", bars: [1, 3, 5, 7] },
  });

  function musicPlanForGame(key) {
    const category = key ? gameCategory(key) : "look";
    const source = BGM_PLANS[category] || BGM_PLANS.look;
    const hash = String(key || "home").split("").reduce((sum, character) => sum + character.codePointAt(0), 0);
    const bar = source.bars[hash % source.bars.length];
    return {
      theme: category,
      label: source.label,
      offset: bar * BGM_BAR_SECONDS,
    };
  }

  function selectBgmForGame(audio, key) {
    if (!key || bgmGameKey === key) return;
    bgmGameKey = key;
    const plan = musicPlanForGame(key);
    const token = ++bgmSeekToken;
    const applyOffset = () => {
      if (token !== bgmSeekToken || bgmGameKey !== key) return;
      const maximum = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - 0.25) : plan.offset;
      try {
        audio.currentTime = Math.min(plan.offset, maximum);
      } catch {
        // The metadata listener below will try again when seeking becomes available.
      }
    };
    if (audio.readyState >= 1) applyOffset();
    else audio.addEventListener("loadedmetadata", applyOffset, { once: true });
  }

  function setBgmDucked(ducked) {
    if (!bgmAudio) return;
    bgmAudio.volume = musicVolume * (ducked ? 0.22 : 1);
  }

  function startBgm() {
    if (!musicEnabled || document.hidden) return;
    const audio = ensureBgm();
    selectBgmForGame(audio, activeGameKey);
    audio.volume = musicVolume;
    audio.play().catch(() => {});
  }

  function stopBgm(reset = false) {
    if (!bgmAudio) return;
    bgmAudio.pause();
    if (reset) {
      bgmSeekToken += 1;
      bgmGameKey = null;
      bgmAudio.currentTime = 0;
    }
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

  function gameKeyFromLocation() {
    if (!window.location.hash.startsWith(GAME_HASH_PREFIX)) return null;
    try {
      const key = decodeURIComponent(window.location.hash.slice(GAME_HASH_PREFIX.length));
      return Object.prototype.hasOwnProperty.call(GAMES, key) ? key : null;
    } catch {
      return null;
    }
  }

  function gameUrl(key) {
    const url = new URL(window.location.href);
    url.hash = GAME_HASH_PREFIX.slice(1) + encodeURIComponent(key);
    return url;
  }

  function clearGameUrl() {
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url);
  }

  function renderStoryIntro(key) {
    const chapter = STORY_BY_KEY[key];
    if (!chapter) {
      renderRound();
      return;
    }
    activeActivity?.destroy();
    activeActivity = null;
    gameName.textContent = `${chapter.index + 1}장 · ${chapter.title}`;
    progressBar.innerHTML = "";
    replayButton.disabled = true;
    const art = chapter.art || CATEGORY_ART[gameCategory(key)];
    playMain.innerHTML = `
      <div class="story-intro-card">
        <img src="${art}" alt="${chapter.title} 이야기 장면" width="512" height="512" />
        <div class="story-intro-copy">
          <span class="section-kicker">몽글이의 반짝이는 하루 · ${chapter.index + 1}장</span>
          <h2 tabindex="-1">${chapter.title}</h2>
          <p>${chapter.intro}</p>
          <div class="story-mission"><strong>오늘의 미션</strong><br>${chapter.mission}</div>
          <div class="story-intro-actions">
            <button class="story-begin" type="button">이야기 시작!</button>
            <button class="story-catalog" type="button">다른 놀이 보기</button>
          </div>
        </div>
      </div>`;
    const begin = playMain.querySelector(".story-begin");
    begin.addEventListener("click", () => {
      restorePlayTemplate();
      replayButton.disabled = false;
      renderRound();
    });
    playMain.querySelector(".story-catalog").addEventListener("click", closeGame);
    window.setTimeout(() => playMain.querySelector(".story-intro-copy h2")?.focus({ preventScroll: true }), 80);
  }

  function startGame(key, { updateUrl = true, story = false } = {}) {
    if (!GAMES[key]) return;
    const shellAlreadyOpen = shell.classList.contains("is-open");
    if (updateUrl && gameKeyFromLocation() !== key) {
      if (shellAlreadyOpen) {
        window.history.replaceState({ ...(window.history.state || {}), mongleGame: key }, "", gameUrl(key));
      } else {
        window.history.pushState({ mongleGame: key, returnToCatalog: true }, "", gameUrl(key));
      }
    }
    if (!shellAlreadyOpen) {
      returnFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    activeGameKey = key;
    activeStoryMode = Boolean(story && STORY_BY_KEY[key]);
    updatePlayTimeChip();
    startPlayClock();
    updateMusicControls();
    startBgm();
    playChime("start");
    clearTimeout(advanceTimer);
    clearIdleHint();
    roundIndex = 0;
    wrongAttempts = 0;
    roundSettled = false;
    restorePlayTemplate();
    replayButton.disabled = false;
    shell.classList.remove("is-closing");
    shell.classList.add("is-open");
    shell.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.title = GAMES[key].title + " | 몽글몽글 배움 놀이터";
    if (activeStoryMode) renderStoryIntro(key);
    else renderRound();
    document.querySelector("#game-close").focus({ preventScroll: true });
  }

  function closeGame({ updateUrl = true } = {}) {
    if (updateUrl && gameKeyFromLocation()) {
      if (window.history.state?.returnToCatalog) {
        window.history.back();
        return;
      }
      clearGameUrl();
    }
    clearTimeout(advanceTimer);
    clearIdleHint();
    pausePlayClock();
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
      activeStoryMode = false;
      document.title = DEFAULT_TITLE;
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
      countCompare: "●⚖●",
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
    speak(activeActivity?.speech || activeActivity?.prompt || round.speech || round.prompt);
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
    const ownsScene = ["count", "countCompare", "compare", "memory", "pattern", "spot", "trace", "order", "sequence", "draw"].includes(mode);
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
        difficulty: adaptiveLevelForGame(activeGameKey),
        onAttempt: recordAttempt,
        onComplete: completeCurrentRound,
        onMistake: reportRoundMistake,
        onProgress: playChime,
        announce: announceActivity,
      });
      if (activeActivity?.prompt) promptElement.textContent = activeActivity.prompt;
      if (activeActivity?.helper) promptHelper.textContent = activeActivity.helper;
    }

    speakRoundInstruction(round);
    scheduleIdleHint();
    window.setTimeout(() => promptElement.focus({ preventScroll: true }), 80);
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

  function clearIdleHint() {
    clearTimeout(idleHintTimer);
    idleHintTimer = null;
  }

  function markRoundInteraction() {
    if (roundSettled) return;
    roundHasInteraction = true;
    clearIdleHint();
  }

  function recordRoundAssist() {
    if (roundAssistRecorded || !activeGameKey) return;
    roundAssistRecorded = true;
    dailyProgress.hints = (Number(dailyProgress.hints) || 0) + 1;
    learnerProfile.totalHints = (Number(learnerProfile.totalHints) || 0) + 1;
    gameStat(activeGameKey).hints += 1;
    recordActivity("hint");
    saveProgress();
    saveLearnerProfile();
  }

  function scheduleIdleHint() {
    clearIdleHint();
    roundHasInteraction = false;
    roundAssistRecorded = false;
    const gameKey = activeGameKey;
    const activeRound = roundIndex;
    const level = adaptiveLevelForGame(gameKey);
    const delay = level === "support" ? 5000 : level === "challenge" ? 9000 : 7000;
    idleHintTimer = window.setTimeout(() => {
      if (
        document.hidden ||
        roundSettled ||
        roundHasInteraction ||
        activeGameKey !== gameKey ||
        roundIndex !== activeRound
      ) return;
      recordRoundAssist();
      activeActivity?.hint();
      const hintPill = interactionHintElement;
      hintPill?.classList.add("is-auto-help");
      feedbackElement.textContent = "괜찮아, 반짝이는 곳부터 천천히 시작해 봐요.";
      feedbackElement.className = "feedback gentle-help";
      announceActivity("반짝이는 곳부터 시작해 봐요.");
      speak("반짝이는 곳부터 천천히 시작해 볼까?");
      window.setTimeout(() => hintPill?.classList.remove("is-auto-help"), 2200);
    }, delay);
  }

  function recordAttempt(correct = false) {
    dailyProgress.attempts += 1;
    dailyProgress.lastPlayed = activeGameKey;
    learnerProfile.totalAttempts += 1;
    if (correct) learnerProfile.totalCorrect += 1;
    const stats = gameStat(activeGameKey);
    stats.attempts += 1;
    if (correct) stats.correct += 1;
    stats.recent = [...stats.recent, Boolean(correct)].slice(-8);
    recordActivity("attempt", { correct });
    saveProgress();
    saveLearnerProfile();
  }

  function completeCurrentRound(source, { record = true } = {}) {
    const round = currentRound();
    if (!round || roundSettled) return;
    if (record) recordAttempt(true);
    clearIdleHint();
    roundSettled = true;
    roundInstructionToken += 1;
    answersElement.classList.add("is-resolved");
    answersElement.querySelectorAll("button").forEach((control) => {
      control.disabled = true;
      control.classList.remove("hint", "is-hint");
    });
    source?.classList.add("is-correct");
    replayButton.disabled = true;
    const successMessage = activeActivity?.completion || round.success;
    feedbackElement.textContent = "★ " + successMessage;
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
    const spoken = speak(successMessage, {
      onended: () => {
        clearTimeout(advanceTimer);
        advanceTimer = window.setTimeout(advance, 280);
      },
    });
    advanceTimer = window.setTimeout(advance, spoken ? 7000 : 1900);
  }

  function reportRoundMistake(source, hintTargets) {
    if (roundSettled) return;
    recordAttempt(false);
    wrongAttempts += 1;
    source?.classList.remove("try-again");
    if (source) void source.offsetWidth;
    source?.classList.add("try-again");
    feedbackElement.textContent =
      wrongAttempts === 1 ? "괜찮아! 그림을 천천히 다시 살펴봐요." : "정답과 이어지는 곳을 반짝여 줄게요.";
    feedbackElement.className = "feedback retry";
    playChime("retry");
    speak(wrongAttempts === 1 ? "괜찮아. 다시 한번 찾아볼까?" : "정답 친구가 살짝 움직일 거야.");

    if (wrongAttempts >= 2) {
      recordRoundAssist();
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
    clearIdleHint();
    roundInstructionToken += 1;
    activeActivity?.destroy();
    activeActivity = null;
    const game = GAMES[activeGameKey];
    const storyMode = activeStoryMode;
    const storyChapter = storyMode ? STORY_BY_KEY[activeGameKey] : null;
    const nextChapter = storyChapter ? STORY_CHAPTERS[storyChapter.index + 1] : null;
    const isNewSticker = !learnerProfile.stickers.includes(activeGameKey);
    learnerProfile.completed[activeGameKey] = (learnerProfile.completed[activeGameKey] || 0) + 1;
    learnerProfile.xp += isNewSticker ? 100 : 30;
    if (isNewSticker) learnerProfile.stickers.push(activeGameKey);
    dailyProgress.completed[activeGameKey] = (dailyProgress.completed[activeGameKey] || 0) + 1;
    dailyProgress.lastPlayed = activeGameKey;
    recordActivity("completion");
    saveProgress();
    saveLearnerProfile();
    pausePlayClock();
    replayButton.disabled = true;
    renderProgress(game.rounds.length, game.rounds.length);
    progressBar.querySelectorAll(".progress-dot").forEach((dot) => {
      dot.classList.remove("current");
      dot.classList.add("done");
    });

    if (playLimitReached()) {
      playMain.innerHTML = `
        <div class="completion-card break-completion">
          <div class="completion-sticker ${isNewSticker ? "is-new-sticker" : ""}" aria-hidden="true">${isNewSticker ? game.icon : "🌿"}</div>
          <p class="completion-label">${game.title} 놀이도 멋지게 끝냈어요!</p>
          <h2>몽글이도 쉬는 시간이야</h2>
          <span class="completion-reward">+${isNewSticker ? 100 : 30} XP · LEVEL ${profileLevel()}</span>
          <p>약속한 놀이 시간이 되었어요.<br>눈과 몸을 편안하게 쉬어 줄까요?</p>
          <div class="break-promise-list" aria-label="쉬는 시간 약속">
            <span>👀 먼 곳 바라보기</span><span>🙆 두 팔 쭉 펴기</span><span>💧 물 한 모금</span>
          </div>
          <div class="completion-actions">
            <button class="completion-home" type="button">오늘은 여기까지</button>
            <button class="completion-more" type="button">보호자와 5분 더</button>
          </div>
        </div>`;
      playMain.querySelector(".completion-home").addEventListener("click", () => {
        resetPlayClock();
        closeGame();
      });
      playMain.querySelector(".completion-more").addEventListener("click", () => {
        requestParentAccess(() => {
          playExtensionMinutes += 5;
          updatePlayTimeChip();
          startGame(recommendedGame());
          showToast("보호자와 5분 더 놀기로 했어요.");
        });
      });
      playChime("success");
      speak("놀이 약속 시간이 되었어. 몽글이와 눈과 몸을 쉬어 볼까?");
      return;
    }

    playMain.innerHTML = `
      <div class="completion-card">
        <div class="completion-sticker ${isNewSticker ? "is-new-sticker" : ""}" aria-hidden="true">${isNewSticker ? game.icon : "★"}</div>
        <p class="completion-label">${isNewSticker ? "새 스티커를 찾았어요!" : "다시 만나 더 단단해졌어요!"}</p>
        <h2>우와, 다 해냈어!</h2>
        <span class="completion-reward">+${isNewSticker ? 100 : 30} XP · LEVEL ${profileLevel()}</span>
        <p>${game.title} 놀이를 끝까지 즐겼어요.<br>이제 잠깐 쉬어도 좋아요.</p>
        <div class="completion-actions">
          <button class="completion-home" type="button">다른 놀이 만나기</button>
          ${nextChapter ? `<button class="completion-next" type="button">다음 이야기</button>` : ""}
          <button class="completion-again" type="button">한 번 더</button>
        </div>
      </div>`;

    playMain.querySelector(".completion-home").addEventListener("click", closeGame);
    playMain.querySelector(".completion-again").addEventListener("click", () => startGame(activeGameKey, { story: storyMode }));
    playMain.querySelector(".completion-next")?.addEventListener("click", () => startGame(nextChapter.key, { story: true }));
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
    const dailyNext = ensureDailyPlan().find((key) => !dailyProgress.completed[key]);
    if (dailyNext) return dailyNext;
    const category = Object.keys(CATEGORY_NAMES)
      .map((key) => ({ key, ...categoryProgress(key) }))
      .sort((a, b) => a.percent - b.percent || a.completed - b.completed)[0]?.key;
    return Object.keys(GAMES).find((key) => gameCategory(key) === category && !learnerProfile.completed[key])
      || Object.keys(GAMES).sort((a, b) => (learnerProfile.completed[a] || 0) - (learnerProfile.completed[b] || 0))[0]
      || "colors";
  }

  function dateKeyOffset(daysAgo) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function weeklySnapshot() {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = dateKeyOffset(6 - index);
      return { date, ...normalizeActivityDay(learnerProfile.activityDays?.[date]) };
    });
    const categories = Object.fromEntries(Object.keys(CATEGORY_NAMES).map((category) => [category, {
      attempts: 0,
      correct: 0,
      hints: 0,
    }]));
    days.forEach((day) => {
      Object.keys(categories).forEach((category) => {
        categories[category].attempts += day.categories[category].attempts;
        categories[category].correct += day.categories[category].correct;
        categories[category].hints += day.categories[category].hints;
      });
    });
    const activeDays = days.filter((day) => day.attempts || day.completions || day.hints).length;
    const observed = Object.entries(categories).filter(([, stats]) => stats.attempts > 0);
    const strength = observed.slice().sort(([, left], [, right]) => {
      const leftRate = left.correct / left.attempts;
      const rightRate = right.correct / right.attempts;
      return rightRate - leftRate || right.attempts - left.attempts || left.hints - right.hints;
    })[0] || null;
    const unobserved = Object.entries(categories)
      .filter(([, stats]) => !stats.attempts)
      .sort(([left], [right]) => categoryProgress(left).completed - categoryProgress(right).completed);
    const focus = unobserved[0] || observed.slice().sort(([, left], [, right]) => {
      const leftRate = left.correct / left.attempts;
      const rightRate = right.correct / right.attempts;
      return leftRate - rightRate || right.hints - left.hints || left.attempts - right.attempts;
    })[0] || null;
    return { days, categories, activeDays, strength, focus };
  }

  function recommendationForCategory(category) {
    if (!category) return recommendedGame();
    const dailyCandidate = ensureDailyPlan().find((key) => gameCategory(key) === category && !dailyProgress.completed[key]);
    if (dailyCandidate) return dailyCandidate;
    return Object.keys(GAMES)
      .filter((key) => gameCategory(key) === category)
      .sort((left, right) => {
        const leftStats = learnerProfile.gameStats[left] || {};
        const rightStats = learnerProfile.gameStats[right] || {};
        return (learnerProfile.completed[left] || 0) - (learnerProfile.completed[right] || 0)
          || (leftStats.attempts || 0) - (rightStats.attempts || 0)
          || left.localeCompare(right);
      })[0] || recommendedGame();
  }

  function renderWeeklyReport() {
    const snapshot = weeklySnapshot();
    document.querySelector("#weekly-active-days").textContent = String(snapshot.activeDays);
    const chart = document.querySelector("#weekly-chart");
    chart.innerHTML = "";
    const scores = snapshot.days.map((day) => day.correct + day.completions * 2);
    const maxScore = Math.max(1, ...scores);
    snapshot.days.forEach((day, index) => {
      const date = new Date(`${day.date}T12:00:00`);
      const label = index === snapshot.days.length - 1 ? "오늘" : new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
      const score = scores[index];
      const column = document.createElement("div");
      column.className = `weekly-day${score ? " is-active" : ""}${index === snapshot.days.length - 1 ? " is-today" : ""}`;
      column.setAttribute("aria-label", `${label}, 성공 ${day.correct}번, 완료 ${day.completions}개`);
      column.innerHTML = `<span class="weekly-bar"><i style="height:${score ? Math.max(18, Math.round((score / maxScore) * 100)) : 6}%"></i></span><b>${label}</b>`;
      chart.appendChild(column);
    });

    const strengthTitle = document.querySelector("#weekly-strength");
    const strengthDetail = document.querySelector("#weekly-strength-detail");
    if (snapshot.strength) {
      const [category, stats] = snapshot.strength;
      const accuracy = Math.round((stats.correct / stats.attempts) * 100);
      strengthTitle.textContent = `${CATEGORY_NAMES[category]} · ${accuracy}%`;
      strengthDetail.textContent = `${stats.attempts}번 살펴본 결과예요. 정답 횟수뿐 아니라 도움을 요청한 순간도 함께 봤어요.`;
    } else {
      strengthTitle.textContent = "조금 더 관찰 중이에요";
      strengthDetail.textContent = "한두 놀이를 시작하면 아이가 편안해하는 영역을 알려드려요.";
    }

    const focusCategory = snapshot.focus?.[0] || null;
    const focusStats = snapshot.focus?.[1] || null;
    const focusTitle = document.querySelector("#weekly-focus");
    const focusDetail = document.querySelector("#weekly-focus-detail");
    if (!focusCategory) {
      focusTitle.textContent = "오늘 코스부터 시작해요";
      focusDetail.textContent = "짧게 성공할 수 있는 놀이를 골라 드릴게요.";
    } else if (!focusStats.attempts) {
      focusTitle.textContent = `${CATEGORY_NAMES[focusCategory]} 영역을 만나 볼 차례`;
      focusDetail.textContent = "이번 주에 아직 충분히 만나지 않은 영역이라 부담 없는 첫 놀이를 추천해요.";
    } else {
      const accuracy = Math.round((focusStats.correct / focusStats.attempts) * 100);
      focusTitle.textContent = `${CATEGORY_NAMES[focusCategory]} 영역을 천천히`;
      focusDetail.textContent = `${focusStats.attempts}번 중 ${accuracy}%의 성공 경험이 있었어요. 같은 힘을 쉬운 활동으로 이어가요.`;
    }

    const recommendationKey = recommendationForCategory(focusCategory);
    const recommendation = GAMES[recommendationKey];
    const button = document.querySelector("#weekly-recommendation");
    button.dataset.weeklyGame = recommendationKey;
    button.setAttribute("aria-label", `이번 주 맞춤 추천, ${recommendation.title}, 바로 놀이`);
    document.querySelector("#weekly-recommendation-title").textContent = `${recommendation.icon} ${recommendation.title}`;
  }

  function roundedCanvasRect(context, x, y, width, height, radius, fill) {
    const corner = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + corner, y);
    context.arcTo(x + width, y, x + width, y + height, corner);
    context.arcTo(x + width, y + height, x, y + height, corner);
    context.arcTo(x, y + height, x, y, corner);
    context.arcTo(x, y, x + width, y, corner);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }

  function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 2) {
    const characters = [...String(text)];
    const lines = [];
    let line = "";
    characters.forEach((character) => {
      const next = line + character;
      if (line && context.measureText(next).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    const visible = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      let last = visible[maxLines - 1];
      while (last && context.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
      visible[maxLines - 1] = last + "…";
    }
    visible.forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
    return y + visible.length * lineHeight;
  }

  function createWeeklyReportCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    const snapshot = weeklySnapshot();
    const nickname = learnerProfile.nickname || "꼬마 탐험가";
    const recommendationKey = document.querySelector("#weekly-recommendation").dataset.weeklyGame || recommendedGame();
    const recommendation = GAMES[recommendationKey];
    const dateFormat = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });
    const startDate = new Date(`${snapshot.days[0].date}T12:00:00`);
    const endDate = new Date(`${snapshot.days[6].date}T12:00:00`);
    const font = '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';

    context.fillStyle = "#f6fbf7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const glow = context.createRadialGradient(940, 100, 10, 940, 100, 380);
    glow.addColorStop(0, "rgba(255, 212, 93, 0.30)");
    glow.addColorStop(1, "rgba(255, 212, 93, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, 500);

    roundedCanvasRect(context, 70, 64, 240, 64, 32, "#dff5eb");
    context.fillStyle = "#247a60";
    context.font = `800 28px ${font}`;
    context.fillText("몽글 · 최근 7일", 105, 106);
    context.fillStyle = "#352f2a";
    context.font = `900 54px ${font}`;
    drawWrappedText(context, `${nickname}의 성장 발자국`, 70, 190, 900, 68, 2);
    context.fillStyle = "#746c66";
    context.font = `650 25px ${font}`;
    context.fillText(`${dateFormat.format(startDate)} – ${dateFormat.format(endDate)} · 이 기기에서 만든 비공개 리포트`, 72, 290);

    roundedCanvasRect(context, 70, 340, 940, 280, 36, "#ffffff");
    context.fillStyle = "#746c66";
    context.font = `800 24px ${font}`;
    context.fillText("이번 주 놀이", 108, 390);
    context.fillStyle = "#247a60";
    context.font = `900 72px ${font}`;
    context.fillText(String(snapshot.activeDays), 108, 475);
    context.font = `800 29px ${font}`;
    context.fillText("일 함께했어요", 182, 472);

    const scores = snapshot.days.map((day) => day.correct + day.completions * 2);
    const maxScore = Math.max(1, ...scores);
    const chartX = 430;
    const chartBottom = 550;
    const chartWidth = 510;
    snapshot.days.forEach((day, index) => {
      const score = scores[index];
      const x = chartX + index * (chartWidth / 7) + 15;
      const height = score ? Math.max(22, Math.round((score / maxScore) * 132)) : 8;
      roundedCanvasRect(context, x, chartBottom - height, 42, height, 12, score ? "#62c9a6" : "#e7ede9");
      context.fillStyle = index === 6 ? "#247a60" : "#8b837d";
      context.font = `800 18px ${font}`;
      const label = index === 6 ? "오늘" : new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(new Date(`${day.date}T12:00:00`));
      context.fillText(label, x + 2, 585);
    });

    roundedCanvasRect(context, 70, 650, 455, 250, 32, "#e8f7f0");
    context.fillStyle = "#247a60";
    context.font = `800 22px ${font}`;
    context.fillText("잘 자라는 힘", 108, 700);
    context.fillStyle = "#352f2a";
    context.font = `900 37px ${font}`;
    drawWrappedText(context, document.querySelector("#weekly-strength").textContent, 108, 758, 375, 48, 2);
    context.fillStyle = "#746c66";
    context.font = `650 21px ${font}`;
    drawWrappedText(context, document.querySelector("#weekly-strength-detail").textContent, 108, 840, 375, 30, 2);

    roundedCanvasRect(context, 555, 650, 455, 250, 32, "#f1ecfa");
    context.fillStyle = "#7359a5";
    context.font = `800 22px ${font}`;
    context.fillText("다음에 도와줄 힘", 593, 700);
    context.fillStyle = "#352f2a";
    context.font = `900 35px ${font}`;
    drawWrappedText(context, document.querySelector("#weekly-focus").textContent, 593, 758, 375, 46, 2);
    context.fillStyle = "#746c66";
    context.font = `650 21px ${font}`;
    drawWrappedText(context, document.querySelector("#weekly-focus-detail").textContent, 593, 840, 375, 30, 2);

    roundedCanvasRect(context, 70, 940, 940, 160, 32, "#40362f");
    context.fillStyle = "rgba(255,255,255,0.72)";
    context.font = `800 21px ${font}`;
    context.fillText("이번 주 맞춤 추천", 108, 992);
    context.fillStyle = "#ffffff";
    context.font = `900 39px ${font}`;
    drawWrappedText(context, `${recommendation.icon} ${recommendation.title}`, 108, 1054, 820, 46, 1);

    context.fillStyle = "#352f2a";
    context.font = `900 28px ${font}`;
    context.fillText("짧게, 즐겁게, 아이의 속도로.", 70, 1175);
    context.fillStyle = "#746c66";
    context.font = `650 20px ${font}`;
    drawWrappedText(context, "이 리포트는 정답 경험과 도움 기록을 바탕으로 기기 안에서만 만들었어요. 아이를 평가하거나 다른 아이와 비교하는 자료가 아니에요.", 70, 1220, 930, 31, 3);
    context.fillStyle = "#247a60";
    context.font = `850 19px ${font}`;
    context.fillText("MONGLE PLAYGROUND · 개인정보 외부 전송 없음", 70, 1310);
    return canvas;
  }

  async function saveWeeklyReport() {
    const button = document.querySelector("#save-weekly-report");
    if (button.disabled) return;
    button.disabled = true;
    try {
      const canvas = createWeeklyReportCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG creation failed");
      const filename = `mongle-growth-${todayKey()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        try {
          await navigator.share({ title: "몽글 주간 성장 리포트", text: "최근 7일 성장 발자국이에요.", files: [file] });
          showToast("성장 카드를 공유했어요.");
          return;
        } catch (error) {
          if (error?.name === "AbortError") {
            showToast("공유를 취소했어요.");
            return;
          }
        }
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("성장 카드를 저장했어요.");
    } catch {
      showToast("성장 카드를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      button.disabled = false;
    }
  }

  function setBackupStatus(message, state = "") {
    const section = document.querySelector(".backup-settings");
    section.classList.toggle("is-success", state === "success");
    section.classList.toggle("is-error", state === "error");
    document.querySelector("#backup-status").textContent = message;
  }

  function exportBackup() {
    const payload = {
      format: "mongle-local-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      app: { games: Object.keys(GAMES).length, profileVersion: 2 },
      profile: learnerProfile,
      daily: dailyProgress,
      settings: {
        soundEnabled,
        musicEnabled,
        musicVolume,
        playLimitMinutes,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mongle-backup-${todayKey()}.mongle.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupStatus("백업 파일을 저장했어요. 새 기기의 보호자 공간에서 불러올 수 있어요.", "success");
    showToast("몽글 기록 백업을 저장했어요.");
  }

  async function importBackupFile(file) {
    if (!file) return;
    try {
      if (file.size <= 0 || file.size > 1024 * 1024) throw new Error("invalid size");
      const payload = JSON.parse(await file.text());
      if (payload?.format !== "mongle-local-backup" || payload.version !== 1) throw new Error("invalid format");
      const profile = normalizeLearnerProfile(payload.profile);
      if (!profile) throw new Error("invalid profile");
      const daily = normalizeDailyProgress(payload.daily);
      if (!window.confirm("현재 이 기기의 기록을 백업 파일의 기록으로 바꿀까요?")) {
        setBackupStatus("불러오기를 취소했어요. 현재 기록은 그대로예요.");
        return;
      }

      learnerProfile = profile;
      dailyProgress = daily;
      if (typeof payload.settings?.soundEnabled === "boolean") soundEnabled = payload.settings.soundEnabled;
      if (typeof payload.settings?.musicEnabled === "boolean") musicEnabled = payload.settings.musicEnabled;
      const importedVolume = Number(payload.settings?.musicVolume);
      if (Number.isFinite(importedVolume) && importedVolume >= 0 && importedVolume <= 0.35) musicVolume = importedVolume;
      const importedPlayLimit = Number(payload.settings?.playLimitMinutes);
      if ([0, 5, 10, 15].includes(importedPlayLimit)) playLimitMinutes = importedPlayLimit;
      resetPlayClock();
      persistProgress();
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(learnerProfile));
      } catch {
        // The restored data still remains available for this session.
      }
      saveSoundPreference();
      saveMusicPreference();
      saveMusicVolume();
      savePlayLimit();
      updateSoundButton();
      updateMusicControls();
      if (!musicEnabled) stopBgm();
      updateTodayCard();
      updatePremiumDashboard();
      updateParentDashboard();
      setBackupStatus("몽글 기록을 안전하게 불러왔어요.", "success");
      showToast("몽글 기록을 불러왔어요.");
    } catch {
      setBackupStatus("몽글 백업 파일을 확인하지 못했어요. 다른 파일을 선택해 주세요.", "error");
      showToast("올바른 몽글 백업 파일이 아니에요.");
    } finally {
      document.querySelector("#backup-file").value = "";
    }
  }

  function renderParentObservation() {
    const key = dailyProgress.lastPlayed && GAMES[dailyProgress.lastPlayed] ? dailyProgress.lastPlayed : null;
    const gameLabel = document.querySelector("#observation-game");
    const status = document.querySelector("#observation-status");
    const buttons = [...document.querySelectorAll("[data-observation]")];
    if (!key) {
      gameLabel.textContent = "오늘 놀이를 마친 뒤 아이의 모습을 알려 주세요.";
      status.textContent = "놀이 기록이 생기면 보호자의 관찰을 남길 수 있어요.";
      buttons.forEach((button) => {
        button.disabled = true;
        button.setAttribute("aria-pressed", "false");
      });
      return;
    }

    const observation = latestObservation(key);
    const labels = {
      independent: "혼자 해낸 모습으로 기록했어요. 다음에는 한 단계 도전해요.",
      together: "함께한 모습으로 기록했어요. 현재 단계를 편안하게 이어가요.",
      hard: "아직 어려운 모습으로 기록했어요. 다음에는 그림과 단서를 줄여 도와줘요.",
    };
    gameLabel.textContent = `최근 놀이 · ${GAMES[key].title}`;
    status.textContent = observation
      ? labels[observation.level]
      : "보호자의 관찰은 이 놀이의 다음 난이도에 바로 반영돼요.";
    buttons.forEach((button) => {
      button.disabled = false;
      button.setAttribute("aria-pressed", String(button.dataset.observation === observation?.level));
      button.setAttribute("aria-label", `${GAMES[key].title}, ${button.querySelector("strong").textContent}, ${button.querySelector("small").textContent}`);
    });
  }

  function recordParentObservation(level) {
    const key = dailyProgress.lastPlayed;
    if (!GAMES[key] || !["independent", "together", "hard"].includes(level)) return;
    const date = todayKey();
    const existing = (learnerProfile.observations || []).filter((item) => !(item.date === date && item.game === key));
    learnerProfile.observations = [...existing, { date, game: key, level }]
      .filter((item) => item.date >= dateKeyOffset(29))
      .slice(-60);
    saveLearnerProfile();
    updateParentDashboard();
    const toastLabels = {
      independent: "다음에는 한 단계 도전하도록 맞췄어요.",
      together: "현재 단계로 편안하게 이어갈게요.",
      hard: "다음에는 단서를 더해 천천히 도와줄게요.",
    };
    showToast(toastLabels[level]);
  }

  function updateParentDashboard() {
    document.querySelector("#parent-completed").textContent = `${completedCount()}`;
    document.querySelector("#parent-answers").textContent = `${dailyProgress.attempts}`;
    document.querySelector("#parent-hints").textContent = `${Number(dailyProgress.hints) || 0}`;

    const message = document.querySelector("#parent-message");
    const count = completedCount();
    if (count === 0) message.textContent = "첫 놀이를 천천히 시작해 보세요.";
    else if (count < 3) message.textContent = "짧고 즐거운 시도를 이어가고 있어요.";
    else message.textContent = "오늘의 작은 목표를 충분히 만났어요.";

    const nicknameInput = document.querySelector("#child-nickname");
    nicknameInput.value = learnerProfile.nickname || "꼬마 탐험가";
    renderPlayLimitSettings();
    document.querySelector("#parent-level").textContent = String(profileLevel());
    renderWeeklyReport();
    renderParentObservation();

    const growthList = document.querySelector("#growth-skill-list");
    growthList.innerHTML = "";
    Object.entries(CATEGORY_NAMES).forEach(([category, label]) => {
      const accuracy = categoryAccuracy(category);
      const progress = categoryProgress(category);
      const skill = document.createElement("div");
      skill.className = "growth-skill";
      skill.innerHTML = `
        <span><strong>${label}</strong><b>${accuracy.attempts ? `${accuracy.percent}%` : "관찰 전"}</b></span>
        <div class="growth-skill-track" aria-label="${label} 정답 경험 ${accuracy.percent}%"><i style="width:${accuracy.percent}%"></i></div>
        <small>${progress.completed}/${progress.total}개 놀이 · ${accuracy.attempts}번 시도</small>`;
      growthList.appendChild(skill);
    });

    const levels = Object.keys(learnerProfile.gameStats).map(adaptiveLevelForGame);
    const observationCount = (learnerProfile.observations || []).length;
    const challengeCount = levels.filter((level) => level === "challenge").length;
    const supportCount = levels.filter((level) => level === "support").length;
    const adaptiveSummary = document.querySelector("#adaptive-summary");
    if (observationCount) adaptiveSummary.textContent = `최근 보호자 관찰 ${observationCount}개와 아이의 시도를 함께 반영하고 있어요.`;
    else if (!levels.length) adaptiveSummary.textContent = "아이의 최근 시도와 보호자의 관찰을 모아 알맞은 단계를 추천해요.";
    else if (supportCount > challengeCount) adaptiveSummary.textContent = "천천히 성공을 쌓도록 그림 수와 단서를 부드럽게 조절하고 있어요.";
    else if (challengeCount) adaptiveSummary.textContent = "익숙한 놀이에는 그림과 기억 카드를 늘려 한 단계 더 도전하고 있어요.";
    else adaptiveSummary.textContent = "현재 기본 단계가 잘 맞아요. 성공과 어려움을 계속 살펴볼게요.";

    const insight = dailyProgress.lastPlayed ? GAMES[dailyProgress.lastPlayed] : null;
    document.querySelector("#parent-insight-text").textContent = insight
      ? insight.insight
      : "아이가 어떤 카드에 먼저 관심을 보이는지 살펴봐 주세요.";

    const list = document.querySelector("#parent-game-list");
    list.innerHTML = "";
    const playedGames = Object.entries(learnerProfile.gameStats)
      .filter(([key, stats]) => GAMES[key] && (stats.attempts || stats.hints))
      .sort((a, b) => ((b[1].attempts || 0) + (b[1].hints || 0)) - ((a[1].attempts || 0) + (a[1].hints || 0)))
      .slice(0, 12);
    playedGames.forEach(([key, stats]) => {
      const game = GAMES[key];
      const complete = Boolean(learnerProfile.completed[key]);
      const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;
      const item = document.createElement("div");
      item.className = "parent-game-item";
      const state = complete ? `${accuracy}% · 완료` : stats.attempts ? `${stats.attempts}번 시도` : "정답 시도 전";
      item.innerHTML = `
        <span class="parent-game-icon" aria-hidden="true">${game.icon}</span>
        <span><strong>${game.title}</strong><small>${game.skill}</small></span>
        <span class="game-state ${complete ? "complete" : ""}">${state}${stats.hints ? ` · 도움 ${stats.hints}회` : ""}</span>`;
      list.appendChild(item);
    });
    if (!playedGames.length) {
      const empty = document.createElement("p");
      empty.className = "parent-list-empty";
      empty.textContent = "첫 놀이를 시작하면 이곳에 자세한 기록이 보여요.";
      list.appendChild(empty);
    }

    const offline = insight?.offline || GAMES.colors.offline;
    document.querySelector("#offline-tip-title").textContent = offline.title;
    document.querySelector("#offline-tip-text").textContent = offline.text;
  }

  function openParentDialog() {
    updateParentDashboard();
    if (typeof parentDialog.showModal === "function") parentDialog.showModal();
    else parentDialog.setAttribute("open", "");
  }

  function closeParentGate() {
    if (typeof parentGate.close === "function") parentGate.close();
    else parentGate.removeAttribute("open");
  }

  function cancelParentAccess() {
    pendingParentAction = null;
    closeParentGate();
  }

  function requestParentAccess(action) {
    pendingParentAction = typeof action === "function" ? action : null;
    if (Date.now() < parentUnlockedUntil) {
      const approvedAction = pendingParentAction;
      pendingParentAction = null;
      if (approvedAction) approvedAction();
      else openParentDialog();
      return;
    }
    const problems = [[2, 3], [3, 4], [4, 2], [5, 3]];
    const [left, right] = problems[Math.floor(Math.random() * problems.length)];
    const answer = left + right;
    document.querySelector("#parent-gate-question").textContent = `별 ${left}개와 별 ${right}개를 합치면 모두 몇 개일까요?`;
    document.querySelector("#parent-gate-feedback").textContent = "성장 기록과 설정을 안전하게 보호해요.";
    const choices = [answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    const wrap = document.querySelector("#parent-gate-choices");
    wrap.innerHTML = "";
    choices.forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(value);
      button.addEventListener("click", () => {
        if (value !== answer) {
          button.classList.remove("is-wrong");
          void button.offsetWidth;
          button.classList.add("is-wrong");
          document.querySelector("#parent-gate-feedback").textContent = "다시 계산해 주세요.";
          return;
        }
        parentUnlockedUntil = Date.now() + 5 * 60 * 1000;
        const approvedAction = pendingParentAction;
        pendingParentAction = null;
        closeParentGate();
        if (approvedAction) approvedAction();
        else openParentDialog();
      });
      wrap.appendChild(button);
    });
    if (typeof parentGate.showModal === "function") parentGate.showModal();
    else parentGate.setAttribute("open", "");
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

  function updateOfflineStatus(message) {
    const status = document.querySelector("#offline-ready-status");
    if (status) status.textContent = message;
  }

  function updateConnectionState() {
    document.body.classList.toggle("is-offline", !navigator.onLine);
    if (!navigator.onLine) updateOfflineStatus("지금은 오프라인이에요. 준비된 놀이는 그대로 할 수 있어요.");
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

  const syncGameFromUrl = () => {
    const key = gameKeyFromLocation();
    if (key) {
      if (activeGameKey !== key || !shell.classList.contains("is-open")) {
        startGame(key, { updateUrl: false });
      }
      return;
    }
    if (shell.classList.contains("is-open") && !shell.classList.contains("is-closing")) {
      closeGame({ updateUrl: false });
    }
  };

  window.addEventListener("popstate", syncGameFromUrl);
  window.addEventListener("hashchange", syncGameFromUrl);
  const initialGameKey = gameKeyFromLocation();
  if (initialGameKey) {
    window.history.replaceState({ mongleGame: initialGameKey, direct: true }, "", window.location.href);
    startGame(initialGameKey, { updateUrl: false });
  }

  replayButton.addEventListener("click", () => {
    const round = currentRound();
    if (round) {
      markRoundInteraction();
      recordRoundAssist();
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

  document.querySelectorAll("[data-world]").forEach((world) => {
    world.addEventListener("click", () => {
      const filter = document.querySelector(`.filter-chip[data-filter="${world.dataset.world}"]`);
      filter?.click();
      document.querySelector("#games")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelector("#open-growth-report").addEventListener("click", requestParentAccess);

  document.querySelector("#child-nickname").addEventListener("input", (event) => {
    const nickname = event.currentTarget.value.trim().slice(0, 10);
    learnerProfile.nickname = nickname || "꼬마 탐험가";
    saveLearnerProfile();
  });

  const installButton = document.querySelector("#install-app");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
    updateOfflineStatus("이 기기의 홈 화면에 몽글 놀이터를 설치할 수 있어요.");
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      updateOfflineStatus("브라우저 메뉴에서 ‘홈 화면에 추가’를 선택해 주세요.");
      return;
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
    updateOfflineStatus(choice.outcome === "accepted" ? "홈 화면에 설치했어요." : "원할 때 다시 설치할 수 있어요.");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton.hidden = true;
    updateOfflineStatus("홈 화면 앱으로 설치되어 있어요.");
  });

  window.addEventListener("online", () => {
    updateConnectionState();
    updateOfflineStatus("온라인으로 연결됐어요. 오프라인 자료도 준비되어 있어요.");
  });
  window.addEventListener("offline", () => {
    updateConnectionState();
    showToast("오프라인에서도 준비된 놀이를 계속할 수 있어요.");
  });

  const stretchButton = document.querySelector("#stretch-button");
  stretchButton.addEventListener("click", () => {
    const promised = stretchButton.classList.toggle("promised");
    stretchButton.innerHTML = promised
      ? "기지개 완료 <span aria-hidden=\"true\">♥</span>"
      : "기지개 약속 <span aria-hidden=\"true\">♡</span>";
    showToast(promised ? "두 팔을 쭉! 몸도 마음도 시원해요." : "언제든 다시 기지개를 켤 수 있어요.");
  });

  document.querySelector("#parent-open").addEventListener("click", requestParentAccess);
  document.querySelector("#parent-close").addEventListener("click", closeParentDialog);
  document.querySelector("#weekly-recommendation").addEventListener("click", (event) => {
    const key = event.currentTarget.dataset.weeklyGame;
    if (!GAMES[key]) return;
    closeParentDialog();
    startGame(key);
  });
  document.querySelector("#save-weekly-report").addEventListener("click", saveWeeklyReport);
  document.querySelector("#export-backup").addEventListener("click", exportBackup);
  document.querySelector("#import-backup").addEventListener("click", () => document.querySelector("#backup-file").click());
  document.querySelector("#backup-file").addEventListener("change", (event) => importBackupFile(event.target.files?.[0]));
  document.querySelectorAll("[data-observation]").forEach((button) => {
    button.addEventListener("click", () => recordParentObservation(button.dataset.observation));
  });
  document.querySelectorAll("[data-play-limit]").forEach((button) => {
    button.addEventListener("click", () => setPlayLimit(Number(button.dataset.playLimit)));
  });
  document.querySelector("#parent-gate-close").addEventListener("click", cancelParentAccess);
  parentGate.addEventListener("click", (event) => {
    if (event.target === parentGate) cancelParentAccess();
  });
  parentDialog.addEventListener("click", (event) => {
    if (event.target === parentDialog) closeParentDialog();
  });

  document.querySelector("#reset-progress").addEventListener("click", () => {
    if (!window.confirm("오늘의 놀이 기록을 모두 지울까요?")) return;
    const plan = ensureDailyPlan();
    dailyProgress = { ...blankProgress(), plan };
    if (learnerProfile.activityDays) delete learnerProfile.activityDays[todayKey()];
    learnerProfile.observations = (learnerProfile.observations || []).filter((item) => item.date !== todayKey());
    saveProgress();
    saveLearnerProfile();
    updateParentDashboard();
    showToast("오늘의 놀이 기록을 지웠어요.");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopBgm();
      pausePlayClock();
    } else if (shell.classList.contains("is-open")) {
      startBgm();
      startPlayClock();
    }
  });

  window.addEventListener("pagehide", () => {
    stopVoice();
    stopBgm();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") document.body.classList.add("is-keyboard-nav");
    if (event.key === "Escape" && shell.classList.contains("is-open")) {
      event.preventDefault();
      closeGame();
    }
  });

  document.addEventListener("pointerdown", () => {
    document.body.classList.remove("is-keyboard-nav");
  }, { passive: true });

  updateTodayCard();
  updatePremiumDashboard();
  updateSoundButton();
  updateMusicControls();
  renderPlayLimitSettings();
  cachePlayElements();
  updateConnectionState();

  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
    installButton.hidden = true;
    updateOfflineStatus("홈 화면 앱으로 설치되어 있어요.");
  } else if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          if (navigator.onLine) updateOfflineStatus("핵심 놀이와 이야기 그림이 오프라인용으로 준비됐어요.");
        })
        .catch(() => updateOfflineStatus("오프라인 준비를 완료하지 못했어요. 온라인에서는 정상 이용할 수 있어요."));
    });
  } else {
    updateOfflineStatus("이 브라우저에서는 홈 화면 설치를 지원하지 않아요.");
  }
})();
