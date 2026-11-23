import { Router } from "express";
import { activityController } from "../controllers/activityController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(activityController.create));
router.get("/", asyncHandler(activityController.findAll));

router.put("/:id", asyncHandler(activityController.update));
router.delete("/:id", asyncHandler(activityController.delete));

export default router;