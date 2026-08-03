export interface IssuedToken {
  readonly accessToken: string;
  readonly expiresIn: number;
}

export interface TokenIssuer {
  issueAccessToken(userId: string): Promise<IssuedToken>;
}
