export function calculateBMI(heightCm: number, weightKg: number) {
  const meter = heightCm / 100;
  if (!meter || !weightKg) return 0;
  return weightKg / (meter * meter);
}

export function getBmiLabel(bmi: number) {
  if (!bmi) return '입력 필요';
  if (bmi < 18.5) return '저체중';
  if (bmi < 23) return '정상';
  if (bmi < 25) return '과체중';
  if (bmi < 30) return '비만';
  return '고도비만';
}

export function calculateWhtr(heightCm: number, waistCm: number) {
  if (!heightCm || !waistCm) return 0;
  return waistCm / heightCm;
}

export function getWhtrLabel(whtr: number) {
  if (!whtr) return '입력 필요';
  if (whtr < 0.5) return '양호';
  if (whtr < 0.55) return '주의';
  return '복부비만 위험';
}

export function getMotivationMessage(bmi: number, whtr: number, deltaFromStart: number | null) {
  if (!bmi) return '키와 체중을 입력하면 오늘의 출발점이 보입니다.';
  if (deltaFromStart !== null && deltaFromStart <= -1) {
    return '좋습니다. 실제로 내려가고 있습니다. 오늘도 루틴만 지키면 됩니다.';
  }
  if (whtr >= 0.55) {
    return '허리둘레 지표가 먼저 반응할 가능성이 큽니다. 체중보다 루틴 완수율을 우선 보십시오.';
  }
  if (bmi >= 25) {
    return '지금은 의지가 아니라 시스템입니다. 아침 체중 기록과 오늘 운동 완료를 반복하십시오.';
  }
  if (bmi >= 23) {
    return '작은 하락이 누적되면 복부둘레가 먼저 반응합니다. 계속 가면 됩니다.';
  }
  return '지금도 나쁘지 않습니다. 목표는 더 선명한 허리선과 꾸준한 습관입니다.';
}

export function getEstimatedWeightLoss(weeklyPercent: number) {
  return Number((0.416 * (weeklyPercent / 100)).toFixed(2));
}

export function sanitizeDecimalInput(value: string) {
  return value.replace(',', '.').replace(/[^0-9.]/g, '');
}

export type BmiInfo = {
  label: string;
  badge: string;   // CSS class fragment for colour
  pos: number;     // 0-100 position on the gradient bar
};

export function getBmiInfo(bmi: number): BmiInfo {
  // pos maps BMI 14→34 to 0→100
  const pos = Math.min(96, Math.max(4, ((bmi - 14) / 20) * 100));
  if (!bmi)       return { label: '미입력',   badge: 'slate',  pos: 0 };
  if (bmi < 18.5) return { label: '저체중',   badge: 'blue',   pos };
  if (bmi < 23)   return { label: '정상',     badge: 'green',  pos };
  if (bmi < 25)   return { label: '과체중',   badge: 'yellow', pos };
  if (bmi < 30)   return { label: '비만',     badge: 'orange', pos };
  return           { label: '고도비만', badge: 'red',    pos };
}

const BMI_BADGE_STYLES: Record<string, { background: string; color: string }> = {
  slate:  { background: '#f1f5f9', color: '#64748b' },
  blue:   { background: '#eff6ff', color: '#1d4ed8' },
  green:  { background: '#ecfdf5', color: '#065f46' },
  yellow: { background: '#fefce8', color: '#a16207' },
  orange: { background: '#fff7ed', color: '#c2410c' },
  red:    { background: '#fef2f2', color: '#b91c1c' },
};
export function getBmiBadgeStyle(badge: string) {
  return BMI_BADGE_STYLES[badge] ?? BMI_BADGE_STYLES.slate;
}
