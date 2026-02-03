export interface Brand {
  id: string;
  label: string;
}

export interface DrinkSection {
  id: string;
  brand: string;
  items: string[];
}

export interface BrandItem {
  id: string;
  name: string;
}

export type TabType = 'drink' | 'brand';