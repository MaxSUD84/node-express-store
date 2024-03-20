import { Router } from "express";
import file from "../models/file.js";

export const router = Router();

router.get("/", async (req, res) => {
  const works = await file.getAll("works.json");
  res.render("catalog", {
    title: "Каталог",
    isCatalog: true,
    works,
  });
});

router.get("/:id", async (req, res) => {
  const work = await file.getById("works.json", req.params.id);
  res.render("work", {
    layout: "empty",
    title: `Работа: ${work.title}`,
    work,
  });
});

router.get("/:id/edit", async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  const work = await file.getById("works.json", req.params.id);
  res.render("work-edit", {
    layout: "empty",
    title: `Редактирование: ${work.title}`,
    work,
  });
});
