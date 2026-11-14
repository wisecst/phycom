# 프로젝트 1: 가변저항으로 5단계 선풍기 만들기

수업 원본과 같은 1600×900 Stage 안에서 프로젝트 안내, 회로 연결, 코드 작성 안내, 실제 코드의 4페이지를 표시한다. 기존 공통 Stage, 하단 navigation, Entry 카테고리 이미지와 퍼즐/C 반복 블록, DC 선풍기 본체/회전자 mask를 재사용한다.

A1의 0~1023 입력을 0~5 정수로 변환하여 변수 `단계`, 숫자 버튼 모양, D10의 `단계 × 30` 출력에 동일하게 사용한다. Entry의 `arduino_convert_scale` 정수 범위 구현과 동일하게 반올림하고 범위를 제한한다. 0은 정지이며 1~5는 서로 다른 다섯 속도다. 최종 코드를 실행하여 결과 창이 실제 표시된 뒤 저장하기와 학습완료를 함께 활성화하며 닫은 뒤에도 유지한다. 실행 창은 가상 장치의 입력·출력 흐름을 시각화한다.

회로: OrangeBoard 5V/GND → 브레드보드 +/− 레일; 가변저항 OUT → A1, VCC/GND → +/−; DC모터 S → D10, V/G → +/−. 보드와 DC모터 접점은 기존 circuit-editor 핀 좌표 및 motor-circuit.js의 접점 비율을 사용하며 모든 정상 PNG의 원래 종횡비를 유지한다.

지정 준비물의 MM 2개·MF 3개는 그대로 표기한다. 위 회로의 독립 연결은 총 8개로 MM 2개와 MF 6개가 필요하므로 MF 3개가 부족하다. 이 차이는 회로 페이지에 명시하며 수량을 임의 변경하지 않는다.

새 장치 이미지 `rotation-module.png`, `seven-segment-module.png`, `neopixel-module.png`는 제공된 `16-2022-PDF.pdf` 인쇄 페이지 48, 70, 84의 정상 원본 이미지와 PDF soft mask에서 추출했다. 기존 로봇·입력장치 사진은 `phyComDashBoard.png`, 기존 출력장치·회로·선풍기 이미지는 원본 assets를 사용한다.

Entry 변환 구현 참고: https://github.com/entrylabs/entryjs/blob/develop/src/playground/blocks/hardware/block_arduino.js (`arduino_convert_scale`).
