export type LoginRequest = {
  loginId: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  data: {
    user: { id: number; nickname: string };
    tokens: AuthTokens;
  };
};
