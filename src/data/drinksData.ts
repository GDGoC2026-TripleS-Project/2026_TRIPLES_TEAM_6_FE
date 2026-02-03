export type Drink = {
  id: string;
  brandName: string;
  menuName: string;
  optionText: string;
  caffeineMg: number;
  sugarG: number;
  count?: number;
};

export type DayDrinkData = {
  date: string; // 'YYYY-MM-DD'
  drinks: Drink[];
};

export const MOCK_DAY_DRINKS: DayDrinkData[] = [
  {
    date: '2026-01-21',
    drinks: [
      {
        id: 'd1',
        brandName: '스타벅스',
        menuName: '디카페인 골드브루 라떼',
        optionText: 'Ice | Regular | 샷추가',
        caffeineMg: 13,
        sugarG: 4,
      },
    ],
  },
  {
    date: '2026-01-07',
    drinks: [
      {
        id: 'd2',
        brandName: '이디야',
        menuName: '에스프레소 쉐이크',
        optionText: 'Ice | Large',
        caffeineMg: 158,
        sugarG: 19,
      },
    ],
  },
  {
    date: '2026-01-17',
    drinks: [
      {
        id: 'd3',
        brandName: '메가커피',
        menuName: '딸기요거트스무디',
        optionText: 'Ice | Large',
        caffeineMg: 366,
        sugarG: 62,
      },
    ],
  },
  {
    date: '2026-01-20',
    drinks: [
      {
        id: 'd4',
        brandName: '투썸플레이스',
        menuName: '밀크티라떼',
        optionText: 'Ice | Large',
        caffeineMg: 158,
        sugarG: 19,
      },
    ],
  },
];

export function findDrinksByDate(date: string): Drink[] {
  return MOCK_DAY_DRINKS.find((x) => x.date === date)?.drinks ?? [];
}

export function getEventDates(): string[] {
  return MOCK_DAY_DRINKS.map((x) => x.date);
}


export function findDrinksByRange(startDate: string, endDate: string): Drink[] {

  return MOCK_DAY_DRINKS
    .filter((x) => x.date >= startDate && x.date <= endDate)
    .flatMap((x) => x.drinks);
}
