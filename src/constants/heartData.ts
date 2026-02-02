import { Brand, DrinkSection, BrandItem } from '../types/heart';

export const BRANDS: Brand[] = [
  { id: 'all', label: '전체' },
  { id: 'starbucks', label: '스타벅스' },
  { id: 'mgc', label: '메가커피' },
  { id: 'twosome', label: '투썸플레이스' },
  { id: 'edia', label: '이디야' },
  { id: 'compose', label: '컴포즈' },
  { id: 'back', label: '빽다방' },
  { id: 'gucci', label: '파스쿠찌' },
  { id: 'holis', label: '할리스' },
  { id: 'mamard', label: '매머드커피' },
];

export const MOCK_DRINKS: DrinkSection[] = [
  { id: '1', brand: '스타벅스', items: ['카페 아메리카노', '바닐라 라떼'] },
  { id: '2', brand: '메가커피', items: ['메가리카노', '할메가커피', '왕할메가커피'] },
  { id: '3', brand: '투썸플레이스', items: ['스페니쉬 라떼'] },
];

export const MOCK_BRANDS: BrandItem[] = [
  { id: '1', name: '스타벅스' },
  { id: '2', name: '메가커피' },
  { id: '3', name: '투썸플레이스' },
];

export const TABS = [
  { key: 'drink' as const, label: '음료' },
  { key: 'brand' as const, label: '브랜드' },
];