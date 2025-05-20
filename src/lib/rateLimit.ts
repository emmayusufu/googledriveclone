import { NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

const store: RateLimitStore = new Map();

export function rateLimit(
  config: RateLimitConfig = { windowMs: 60000, max: 100 }
) {
  return async (userId: string, request: Request) => {
    const now = Date.now();
    const key = `${userId}:${request.method}:${new URL(request.url).pathname}`;

    if (now % 10 === 0) {
      for (const [entryKey, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(entryKey);
        }
      }
    }

    const entry = store.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
    };

    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }

    entry.count += 1;
    store.set(key, entry);

    if (entry.count > config.max) {
      return NextResponse.json(
        { error: "Too many requests, please try again later" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
          },
        }
      );
    }

    return {
      limitExceeded: false,
      headers: {
        "X-RateLimit-Limit": config.max.toString(),
        "X-RateLimit-Remaining": (config.max - entry.count).toString(),
        "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
      },
    };
  };
}
