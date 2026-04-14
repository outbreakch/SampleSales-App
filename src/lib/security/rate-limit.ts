type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getNow() {
  return Date.now();
}

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
}

export function consumeRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = getNow();

  if (buckets.size > 5000) {
    pruneExpiredBuckets(now);
  }

  const current = buckets.get(key);

  if (!current || current.expiresAt <= now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000)
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000))
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000))
  };
}
