# 업데이트 파일 설치 가이드

## 📦 업데이트된 파일들

이 디렉토리에는 다음 3개의 업데이트된 파일이 포함되어 있습니다:

1. **dataProcessors.js** - `src/utils/` 폴더에 복사
2. **App.jsx** - `src/` 폴더에 복사
3. **ConceptPairItem.jsx** - `src/components/` 폴더에 복사

## 🔧 주요 변경사항

### 1. Top N Pair 선택 기능
- Network 그래프 상단에 드롭다운 추가
- Top 1000, 5000, 10000, All 중 선택 가능
- 선택한 개수만큼의 pair로 네트워크 그래프 생성

### 2. Weight Mode 선택 기능
- **Count Mode**: Community 간 연결을 concept pair의 개수로 계산 (기존 방식)
- **Weighted Mode**: Community 간 연결을 prediction score의 합으로 계산 (새로운 방식)
- Community Pair Ranking도 선택한 mode에 따라 정렬됨

### 3. 버그 수정
- ConceptPairItem의 memo 제거로 여러 pair 동시 확장 시 발생하던 UI 동기화 문제 해결
- Pair 확장 시 해당 community가 네트워크에서 강조 표시됨

## 📝 설치 방법

### 방법 1: 파일 복사 (권장)

1. 이 폴더의 파일들을 프로젝트의 해당 위치에 복사:
   ```
   dataProcessors.js → C:/Users/joonha/Desktop/link_prediction_viewer/src/utils/dataProcessors.js
   App.jsx → C:/Users/joonha/Desktop/link_prediction_viewer/src/App.jsx
   ConceptPairItem.jsx → C:/Users/joonha/Desktop/link_prediction_viewer/src/components/ConceptPairItem.jsx
   ```

2. 브라우저에서 애플리케이션 새로고침

### 방법 2: 백업 후 교체

1. 기존 파일들을 백업:
   ```bash
   # 프로젝트 루트에서 실행
   mkdir backup
   cp src/utils/dataProcessors.js backup/
   cp src/App.jsx backup/
   cp src/components/ConceptPairItem.jsx backup/
   ```

2. 새 파일들을 복사 (방법 1과 동일)

## ✅ 테스트 방법

1. 애플리케이션을 실행하고 Network 그래프 상단의 드롭다운을 확인
2. Top N 값을 변경하면 네트워크 그래프가 업데이트되는지 확인
3. Weight Mode를 변경하면 링크의 굵기와 Community Ranking이 변경되는지 확인
4. Concept pair를 여러 개 동시에 확장해도 정상 작동하는지 확인
5. Pair 확장 시 해당 community가 네트워크에서 강조되는지 확인

## 🐛 문제 해결

### 오류가 발생하는 경우:
1. 브라우저 콘솔(F12)에서 오류 메시지 확인
2. `npm install` 실행하여 의존성 재설치
3. 개발 서버 재시작: `npm run dev`

### 이전 상태로 되돌리기:
```bash
# backup 폴더의 파일들을 복원
cp backup/dataProcessors.js src/utils/
cp backup/App.jsx src/
cp backup/ConceptPairItem.jsx src/components/
```

## 📊 새로운 기능 사용법

### Top N 선택
```
Network 그래프 상단 → "Top 1000" 드롭다운 → 원하는 개수 선택
```

### Weight Mode 변경
```
Network 그래프 상단 → "Count Mode" 드롭다운 → 원하는 모드 선택
- Count Mode: 기존 방식 (pair 개수 기반)
- Weighted Mode: 새로운 방식 (prediction score 합 기반)
```

## 🎯 기대 효과

- **성능 향상**: Top N 선택으로 큰 데이터셋에서도 빠른 렌더링
- **분석 유연성**: Weight Mode 변경으로 다양한 관점에서 community 관계 분석
- **사용자 경험 개선**: 여러 pair 동시 확장 가능, community 강조 표시

---

문제가 발생하거나 추가 도움이 필요하시면 언제든지 문의해주세요!
