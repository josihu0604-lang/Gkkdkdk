# ZZIK UI Fullcode (Landing + Mobile)

## Run
# Landing
cd landing && npm i && NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev -p 3001
# Mobile
cd ../mobile && npm i && EXPO_PUBLIC_API_URL=http://localhost:3000 npm run start

## Notes
- UI는 design-system/globals.css, tokens.json을 우선 참조. 색·간격·그리드는 토큰 기준. 
- 퍼블릭 화면은 병원 실명을 노출하지 않고 지역+전문분야로 표기.
- 서버는 DB ST_DWithin(geography) + 5요소 무결성(60점 통과)을 전제로 동작.
