// lib/rate-limit.ts
const otpRequests = new Map();

export function checkOtpRateLimit(email: string): boolean {
  const now = Date.now();
  const userRequests = otpRequests.get(email) || [];
  
  // Clean old requests (older than 1 hour)
  const recentRequests = userRequests.filter((timestamp: number) => 
    now - timestamp < 60 * 60 * 1000
  );
  
  // Allow max 5 OTP requests per hour
  if (recentRequests.length >= 5) {
    return false;
  }
  
  recentRequests.push(now);
  otpRequests.set(email, recentRequests);
  return true;
}