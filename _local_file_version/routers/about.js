import { Router } from "express";

export const router = Router();

router.get("/", (req, res) => {
  res.render("about", {
    title: "О нас",
    isAbout: true,
  });
});
