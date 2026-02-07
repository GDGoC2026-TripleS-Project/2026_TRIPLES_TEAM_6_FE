import { create } from 'zustand';
import { addMenuFavorite, deleteMenuFavorite } from '../api/record/menu.api';

export type FavoriteMenu = {
  id: number;
  name: string;
  brandId: number;
  brandName: string;
  imageUrl?: string;
  category?: string;
};

type FavoriteMenusState = {
  favorites: FavoriteMenu[];
  addLocal: (menu: FavoriteMenu) => void;
  removeLocal: (menuId: number) => void;
  isFavorite: (menuId: number) => boolean;
};

const useFavoriteMenusStore = create<FavoriteMenusState>((set, get) => ({
  favorites: [],
  addLocal: (menu) =>
    set((state) => {
      const exists = state.favorites.some((m) => m.id === menu.id);
      if (exists) return state;
      return { favorites: [menu, ...state.favorites] };
    }),
  removeLocal: (menuId) =>
    set((state) => ({
      favorites: state.favorites.filter((m) => m.id !== menuId),
    })),
  isFavorite: (menuId) => get().favorites.some((m) => m.id === menuId),
}));

export const useFavoriteMenus = () => {
  const favorites = useFavoriteMenusStore((s) => s.favorites);
  const addLocal = useFavoriteMenusStore((s) => s.addLocal);
  const removeLocal = useFavoriteMenusStore((s) => s.removeLocal);
  const isFavorite = useFavoriteMenusStore((s) => s.isFavorite);

  const toggleFavorite = async (menu: FavoriteMenu, nextLiked: boolean) => {
    if (nextLiked) {
      addLocal(menu);
    } else {
      removeLocal(menu.id);
    }

    try {
      const res = nextLiked
        ? await addMenuFavorite(menu.id)
        : await deleteMenuFavorite(menu.id);

      if (!res.success) {
        throw new Error(res.error?.message ?? '즐겨찾기 처리에 실패했어요.');
      }
    } catch (err) {
      if (__DEV__) console.log('[API ERR] /menus/:id/favorites', err);
      if (nextLiked) {
        removeLocal(menu.id);
      } else {
        addLocal(menu);
      }
    }
  };

  return { favorites, isFavorite, toggleFavorite };
};
