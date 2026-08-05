// src/services/index.js
export * from "./auth.service";
export * from "./user.service";
export * from "./order.service";
export * from "./payment.service";
export * from "./rider.service";

// Also export the api instance for direct use
export { default as api } from "./api";
