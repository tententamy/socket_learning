"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auth.ts
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", AuthController_1.AuthController.register);
router.post("/login", AuthController_1.AuthController.login);
router.post("/refresh", AuthController_1.AuthController.refresh);
router.post("/logout", auth_1.authMiddleware, AuthController_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map