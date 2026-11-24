import type { SessionTokens } from "../ports/session-tokens";

/** Doble de SessionTokens: tokens predecibles ("token-1", "token-2"…) y hash legible. */
export class FakeSessionTokens implements SessionTokens {
  private counter = 0;

  generate(): string {
    this.counter += 1;
    return `token-${this.counter}`;
  }

  hash(token: string): string {
    return `sha256:${token}`;
  }
}
