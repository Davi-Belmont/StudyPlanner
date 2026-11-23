
import { Router } from "express";
import { gradeController } from "../controllers/gradeController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(gradeController.create));
router.get("/", asyncHandler(gradeController.findAll));

router.put("/:id", asyncHandler(gradeController.update));
router.delete("/:id", asyncHandler(gradeController.delete));

export default router;