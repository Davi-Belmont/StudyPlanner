import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

router.get("/me", authMiddleware, asyncHandler(authController.me));

export default router;