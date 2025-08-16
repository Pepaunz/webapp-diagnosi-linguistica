import { testJwtUtils, signJwt, verifyJwt } from './src/utils/jwt.utils';

// Test completo
testJwtUtils();

// Test manuale
const payload = { operator_id: "123", role: "admin" };
const token = signJwt(payload);
const verified = verifyJwt(token);

console.log("Manual test result:", verified);
