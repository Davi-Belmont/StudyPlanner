import { Router } from "express";
import { disciplineController } from "../controllers/disciplineController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(disciplineController.create));
router.get("/", asyncHandler(disciplineController.findAll));

router.get("/:id", asyncHandler(disciplineController.findById));
router.put("/:id", asyncHandler(disciplineController.update));
router.delete("/:id", asyncHandler(disciplineController.delete));

export default router;