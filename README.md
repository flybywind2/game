# 몽글 놀이터

40개월 아이가 색깔, 모양, 수, 말, 동물, 자연, 감정, 생활 습관과 안전을 찾기·세기·짝맞추기·분류·순서·패턴·배치 놀이로 익히는 정적 웹사이트입니다.

## 실행

웹사이트 실행에는 별도 설치나 빌드가 필요하지 않습니다.

```bash
cd /home/ubuntu/project/toddler-learning-games
python3 -m http.server 4173
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다. 현재 Tailscale에서는 `https://free-a1-4ocpu-24gb.tail72928b.ts.net/mongle/` 경로로 제공됩니다.

## 구성

- 실제로 플레이 가능한 놀이 100종, 각 3라운드(총 300라운드)
- 여러 개 찾기 13종, 개수 만들기 9종, 기억 카드 15종, 두 바구니 분류 17종
- 그림 짝 놓기 20종, 순서 만들기 12종, 패턴 완성 4종, 선 따라가기 5종, 크기 순서 4종, 두 무리 비교 1종
- 드래그가 어려울 때는 그림 선택 후 목적지를 누르는 탭 방식으로 똑같이 완료 가능
- 보고 찾기, 수 놀이, 말 놀이, 마음·생활 놀이 분류와 이름 검색
- 처음 24개를 보여주고 24개씩 더 불러오는 긴 목록 최적화
- Supertonic 3의 F1 한국어 음성으로 미리 생성한 실제 재생 문구 703개
- 잔잔한 자체 제작 배경음악, 말소리 중 자동 음량 낮춤, 별도 음악 토글과 음량 저장
- 정적 음원 문제가 생기면 기기의 한국어 음성 엔진으로 자동 대체
- 이미지 생성 도구로 만든 클레이 스타일 래스터 일러스트 5종과 래스터 파비콘
- SVG 이미지 없이 WebP·PNG만 사용하는 반응형 UI
- 오늘 완료 스탬프와 보호자용 로컬 기록
- 키보드 조작, 충분한 터치 영역, 모션 감소 설정 지원

진행 기록과 소리 설정은 브라우저 `localStorage`에만 보관됩니다. 사이트는 실행 중 외부 음성 API에 문장을 전송하지 않습니다.

## 게임 데이터 빌드

추가 게임의 원본 JSON은 `data/extra-games-a.json`, `data/extra-games-b.json`, `data/extra-games-c.json`입니다. 수정 후 브라우저용 파일을 다시 만듭니다.

```bash
node scripts/build_extra_games.mjs
```

## 음원 다시 만들기

Supertonic 가상환경이 준비된 상태에서 앱과 추가 게임 JSON의 실제 재생 문구를 자동 추출해 F1 음원과 manifest를 갱신합니다. 이미 유효한 MP3는 재사용됩니다.

```bash
cd /home/ubuntu/project/toddler-learning-games
/home/ubuntu/project/.venv-supertonic/bin/python scripts/generate_supertonic_audio.py
```

배경음악은 외부 곡을 사용하지 않고 저장소의 합성 스크립트로 만든 24초 루프입니다.

```bash
python3 scripts/generate_bgm.py /tmp/mongle-meadow.wav
ffmpeg -y -i /tmp/mongle-meadow.wav -codec:a libmp3lame -b:a 128k audio/music/mongle-meadow.mp3
```

## 생성 이미지

프로젝트에서 사용하는 최적화 파일은 `assets/generated/mongle-hero.webp`, `game-look.webp`, `game-number.webp`, `game-word.webp`, `game-heart.webp`, `favicon.png`입니다. 같은 폴더의 `*-source.png`는 이미지 생성 도구가 만든 원본입니다.

프롬프트 세트는 따뜻한 크림·민트·코랄 팔레트, 둥근 3D 클레이 질감, 40개월 아이에게 안전한 큰 형태, 글자·로고·워터마크 없음으로 통일했습니다. 히어로는 블록을 쌓는 갈색 몽글이 곰, 분류 이미지는 관찰·수·말·마음/생활 놀이 장면입니다.

음성 안내는 [Supertonic 3](https://github.com/supertone-inc/supertonic)의 F1 음색으로 생성했습니다. 모델 조건은 [Supertonic 3 OpenRAIL-M 라이선스](https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE)를 따릅니다.
