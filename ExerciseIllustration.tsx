import bicepCurlPhoto from '../assets/exercise-photos/bicep-curl.jpg';
import cardioWalkPhoto from '../assets/exercise-photos/cardio-walk.jpg';
import deadliftPhoto from '../assets/exercise-photos/deadlift.jpg';
import hipBridgePhoto from '../assets/exercise-photos/hip-bridge.jpg';
import latPulldownPhoto from '../assets/exercise-photos/lat-pulldown.jpg';
import lungePhoto from '../assets/exercise-photos/lunge.jpg';
import plankPhoto from '../assets/exercise-photos/plank.jpg';
import pushUpPhoto from '../assets/exercise-photos/push-up.jpg';
import shoulderPressPhoto from '../assets/exercise-photos/shoulder-press.jpg';
import squatPhoto from '../assets/exercise-photos/squat.jpg';

type ExerciseIllustrationProps = {
  taskName: string;
};

type ExercisePhoto = {
  src: string;
  alt: string;
  label: string;
  credit: string;
  license: string;
  sourceUrl: string;
};

export type ExerciseGuide = {
  category: string;
  focus: string;
  summary: string;
  cues: string[];
};

const cardioPhoto: ExercisePhoto = {
  src: cardioWalkPhoto,
  alt: '빠르게 걷는 유산소 운동 사진',
  label: '대표 동작: 걷기와 유산소 리듬',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA 4.0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Walkingexercise.jpg',
};

const pushPhoto: ExercisePhoto = {
  src: pushUpPhoto,
  alt: '푸쉬업 자세를 수행하는 사진',
  label: '대표 동작: 가슴과 어깨를 미는 패턴',
  credit: 'Wikimedia Commons',
  license: 'Public domain',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ncc_pushup.jpg',
};

const pullPhoto: ExercisePhoto = {
  src: latPulldownPhoto,
  alt: '랫풀다운 동작을 수행하는 사진',
  label: '대표 동작: 당기기와 등 수축 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA 4.0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Amer-Lat-Pulldown.jpg',
};

const squatPhotoInfo: ExercisePhoto = {
  src: squatPhoto,
  alt: '스쿼트 자세를 수행하는 하체 운동 사진',
  label: '대표 동작: 하체 스쿼트 패턴',
  credit: 'U.S. Air Force / Wikimedia Commons',
  license: 'Public domain',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:A_U.S._Air_Force_Airman_performs_a_squat_exercise.jpg',
};

const lungePhotoInfo: ExercisePhoto = {
  src: lungePhoto,
  alt: '런지 자세를 수행하는 하체 운동 사진',
  label: '대표 동작: 편측 하체와 균형 패턴',
  credit: 'U.S. Air Force / Wikimedia Commons',
  license: 'Public domain',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Airman_performing_lunge.jpg',
};

const plankPhotoInfo: ExercisePhoto = {
  src: plankPhoto,
  alt: '플랭크 자세를 유지하는 코어 운동 사진',
  label: '대표 동작: 코어 버티기 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA 3.0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plankphoto.JPG',
};

const shoulderPhoto: ExercisePhoto = {
  src: shoulderPressPhoto,
  alt: '덤벨 숄더프레스를 수행하는 사진',
  label: '대표 동작: 어깨 위로 밀어 올리는 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Girl_doing_dumbbell_shoulder_press.jpg',
};

const hingePhoto: ExercisePhoto = {
  src: deadliftPhoto,
  alt: '데드리프트 동작을 수행하는 후면사슬 운동 사진',
  label: '대표 동작: 힙 힌지와 후면사슬 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA 3.0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Deadlift.JPG',
};

const bridgePhoto: ExercisePhoto = {
  src: hipBridgePhoto,
  alt: '브리지 자세를 수행하는 둔근 운동 사진',
  label: '대표 동작: 둔근 브리지 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC BY-SA',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:96-Wheels-ExtendedBridge.jpg',
};

const curlPhoto: ExercisePhoto = {
  src: bicepCurlPhoto,
  alt: '덤벨 컬을 수행하는 팔 운동 사진',
  label: '대표 동작: 이두 컬 패턴',
  credit: 'Wikimedia Commons',
  license: 'CC0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dumbbell-Bicep-Curls.jpg',
};

function normalizeTaskName(taskName: string) {
  return taskName.replace(/\([^)]*\)/g, '').replace(/\s+/g, '');
}

function matchesAny(taskName: string, keywords: string[]) {
  return keywords.some((keyword) => taskName.includes(keyword));
}

export function getExerciseGuide(taskName: string): ExerciseGuide {
  const normalized = normalizeTaskName(taskName);

  if (matchesAny(normalized, ['걷기', '러닝', '자전거', '로잉', '유산소', '산책'])) {
    return {
      category: '유산소 운동',
      focus: '심폐 지구력 · 지방 연소',
      summary: '일정한 리듬으로 오래 움직이며 숨은 차지만 대화는 가능한 강도를 목표로 합니다.',
      cues: [
        '상체는 세우고 시선은 정면을 봅니다.',
        '팔은 가볍게 흔들고 발은 부드럽게 디딥니다.',
        '처음에는 속도보다 지속 시간을 지키는 데 집중합니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['플랭크', '마운틴클라이머', '숄더탭', '사이드플랭크'])) {
    return {
      category: '코어 안정화 운동',
      focus: '복부 · 옆구리 · 몸통 안정화',
      summary: '몸통이 흔들리지 않게 버티거나 천천히 팔다리를 움직이는 코어 훈련입니다.',
      cues: [
        '어깨부터 발끝까지 일직선을 유지합니다.',
        '허리가 꺾이지 않게 배에 힘을 줍니다.',
        '횟수보다 자세가 흐트러지지 않는 시간을 우선합니다.',
      ],
    };
  }

  if (normalized.includes('크런치')) {
    return {
      category: '복부 말아올리기 운동',
      focus: '복직근 · 하복부',
      summary: '복부를 조이면서 골반과 상체를 말아 올려 복근 수축을 느끼는 패턴입니다.',
      cues: [
        '목을 당기지 말고 배에 힘을 주며 올라옵니다.',
        '반동보다 복부 수축으로 움직인다는 느낌을 잡습니다.',
        '내려올 때도 힘을 풀지 않고 천천히 버팁니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['푸쉬업', '체스트프레스', '딥스', '인클라인푸쉬업'])) {
    return {
      category: '상체 밀기 운동',
      focus: '가슴 · 어깨 · 삼두',
      summary: '팔로 미는 동작을 통해 상체 전면을 강화하는 대표적인 패턴입니다.',
      cues: [
        '어깨가 올라가지 않게 가슴을 펴고 시작합니다.',
        '손목과 팔꿈치가 한 방향으로 움직이게 유지합니다.',
        '내려갈 때 천천히, 올라올 때 힘 있게 밀어냅니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['숄더프레스', '레터럴레이즈', '옆들기'])) {
    return {
      category: '어깨 중심 운동',
      focus: '전면 어깨 · 측면 어깨',
      summary: '어깨 주변 근육을 키워 상체 라인을 정리하고 밀기 패턴을 보조하는 운동입니다.',
      cues: [
        '어깨를 으쓱하지 말고 목을 길게 유지합니다.',
        '무게보다 어깨에 자극이 오는 궤적을 우선합니다.',
        '반동 없이 천천히 올리고 같은 속도로 내립니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['로우', '랫풀다운'])) {
    return {
      category: '상체 당기기 운동',
      focus: '등 · 광배 · 팔',
      summary: '등을 조이며 팔을 몸 쪽으로 당기는 움직임으로 자세 교정에도 도움이 됩니다.',
      cues: [
        '가슴을 살짝 열고 어깨는 아래로 내립니다.',
        '손보다 팔꿈치를 뒤로 보낸다는 느낌으로 당깁니다.',
        '목에 힘을 주지 말고 등 수축을 먼저 느껴봅니다.',
      ],
    };
  }

  if (normalized.includes('컬')) {
    return {
      category: '팔 보조 운동',
      focus: '이두근 · 팔꿈치 굽힘',
      summary: '팔꿈치를 몸 옆에 고정한 채 팔 앞쪽 근육에 집중하는 동작입니다.',
      cues: [
        '팔꿈치 위치를 고정하고 몸을 흔들지 않습니다.',
        '올릴 때 손목을 꺾지 말고 천천히 들어 올립니다.',
        '내릴 때도 힘을 풀지 않고 버티며 내려옵니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['런지', '스텝업', '불가리안'])) {
    return {
      category: '편측 하체 운동',
      focus: '허벅지 · 엉덩이 · 균형감',
      summary: '한쪽 다리씩 버티며 움직여 하체 힘과 균형을 함께 만드는 패턴입니다.',
      cues: [
        '무릎은 발끝 방향과 나란히 움직입니다.',
        '발바닥 전체로 바닥을 밀어낸다는 느낌을 유지합니다.',
        '상체를 과하게 숙이지 말고 가슴을 편 채 진행합니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['스쿼트', '레그프레스'])) {
    return {
      category: '하체 중심 운동',
      focus: '허벅지 · 엉덩이 · 하체 힘',
      summary: '앉았다 일어나는 패턴으로 하체 전반의 힘과 체형 교정에 도움이 되는 기본 운동입니다.',
      cues: [
        '무릎이 안으로 모이지 않게 유지합니다.',
        '엉덩이를 뒤로 보내며 앉는 느낌을 만듭니다.',
        '올라올 때 발바닥 전체로 바닥을 밀어냅니다.',
      ],
    };
  }

  if (matchesAny(normalized, ['힙브릿지', '힙쓰러스트'])) {
    return {
      category: '둔근 강화 운동',
      focus: '엉덩이 · 햄스트링 · 골반 안정화',
      summary: '엉덩이를 조이며 골반을 들어 올려 둔근을 직접적으로 자극하는 패턴입니다.',
      cues: [
        '허리를 꺾기보다 엉덩이를 조여서 들어 올립니다.',
        '정점에서 1초 정도 멈추며 둔근 수축을 느낍니다.',
        '내려올 때도 힘을 풀지 않고 천천히 버팁니다.',
      ],
    };
  }

  if (normalized.includes('데드리프트')) {
    return {
      category: '힙 힌지 운동',
      focus: '둔근 · 햄스트링 · 허리 보호',
      summary: '엉덩이를 뒤로 빼며 상체를 접어 후면사슬을 쓰는 대표적인 패턴입니다.',
      cues: [
        '허리를 말지 말고 가슴을 살짝 펴서 시작합니다.',
        '무게를 당기기보다 바닥을 밀며 일어납니다.',
        '엉덩이가 먼저 뒤로 빠졌다가 다시 앞으로 돌아옵니다.',
      ],
    };
  }

  return {
    category: '회복 운동',
    focus: '가벼운 움직임 · 유연성 · 순환',
    summary: '몸을 무리 없이 풀어주며 다음 운동을 위한 회복과 컨디션 정리를 돕는 시간입니다.',
    cues: [
      '통증이 없는 범위까지만 움직입니다.',
      '호흡을 길게 하며 몸의 긴장을 풀어줍니다.',
      '강도보다 부드럽고 꾸준한 움직임을 우선합니다.',
    ],
  };
}

export function getExercisePhoto(taskName: string): ExercisePhoto {
  const normalized = normalizeTaskName(taskName);

  if (matchesAny(normalized, ['걷기', '러닝', '자전거', '로잉', '유산소', '산책', '휴식'])) {
    return cardioPhoto;
  }

  if (matchesAny(normalized, ['플랭크', '마운틴클라이머', '숄더탭', '사이드플랭크', '크런치'])) {
    return plankPhotoInfo;
  }

  if (matchesAny(normalized, ['힙브릿지', '힙쓰러스트'])) {
    return bridgePhoto;
  }

  if (normalized.includes('데드리프트')) {
    return hingePhoto;
  }

  if (matchesAny(normalized, ['런지', '스텝업', '불가리안'])) {
    return lungePhotoInfo;
  }

  if (matchesAny(normalized, ['스쿼트', '레그프레스'])) {
    return squatPhotoInfo;
  }

  if (matchesAny(normalized, ['숄더프레스', '레터럴레이즈', '옆들기'])) {
    return shoulderPhoto;
  }

  if (matchesAny(normalized, ['로우', '랫풀다운'])) {
    return pullPhoto;
  }

  if (normalized.includes('컬')) {
    return curlPhoto;
  }

  if (matchesAny(normalized, ['푸쉬업', '체스트프레스', '딥스'])) {
    return pushPhoto;
  }

  return cardioPhoto;
}

export function ExerciseIllustration({ taskName }: ExerciseIllustrationProps) {
  const guide = getExerciseGuide(taskName);
  const photo = getExercisePhoto(taskName);

  return (
    <figure className="exercise-illustration">
      <div className="exercise-illustration__media">
        <img
          className="exercise-illustration__img"
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
        />
        <div className="exercise-illustration__gradient" aria-hidden="true" />
        <figcaption className="exercise-illustration__label">
          <span className="exercise-illustration__chip">{guide.category}</span>
          <strong>{taskName}</strong>
          <span>{photo.label}</span>
        </figcaption>
      </div>
      <div className="exercise-illustration__meta">
        <span className="exercise-illustration__credit">
          사진 출처: {photo.credit} · {photo.license}
        </span>
        <a
          className="exercise-illustration__link"
          href={photo.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          원본 보기
        </a>
      </div>
    </figure>
  );
}
