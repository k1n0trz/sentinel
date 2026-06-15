type DomainRateLimitOptions = {
  max: number;
  now?: () => number;
  windowMs: number;
};

type DomainRateLimitEntry = {
  count: number;
  resetAt: number;
};

type DomainRateLimitResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      retryAfterMs: number;
    };

const domainKey = (targetUrl: URL) =>
  targetUrl.hostname.toLowerCase().replace(/^\[/, '').replace(/\]$/, '');

export const createDomainRateLimiter = ({
  max,
  now = Date.now,
  windowMs,
}: DomainRateLimitOptions) => {
  const entries = new Map<string, DomainRateLimitEntry>();

  return {
    consume(targetUrl: URL): DomainRateLimitResult {
      const currentTime = now();
      const key = domainKey(targetUrl);
      const current = entries.get(key);

      if (!current || current.resetAt <= currentTime) {
        entries.set(key, {
          count: 1,
          resetAt: currentTime + windowMs,
        });

        return { allowed: true };
      }

      if (current.count >= max) {
        return {
          allowed: false,
          retryAfterMs: Math.max(0, current.resetAt - currentTime),
        };
      }

      current.count += 1;
      return { allowed: true };
    },
  };
};
