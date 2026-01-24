let failureCount = 0;
let circuitOpenUntil = 0;

const FAILURE_THRESHOLD = 5;
const OPEN_DURATION_MS = 10_000;

export function recordRedisFailure() {
    failureCount++;
    if (failureCount >= FAILURE_THRESHOLD) {
        circuitOpenUntil = Date.now() + OPEN_DURATION_MS;
    }
}

export function recordRedisSuccess() {
    failureCount = 0;
}

export function isRedisCircuitOpen(): boolean {
    return Date.now() < circuitOpenUntil;
}
