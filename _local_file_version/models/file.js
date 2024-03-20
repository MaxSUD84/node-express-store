import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getAll(filename) {
  return new Promise((resolve, reject) => {
    if (!filename) reject("File name is empty...");

    fs.readFile(
      path.join(__dirname, "..", "data", filename),
      "utf-8",
      (err, content) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(content));
        }
      }
    );
  });
}

async function writeToFile(filename, data) {
  return new Promise((resolve, reject) => {
    if (!filename) reject("File name is empty...");
    if (!data) resolve();

    fs.writeFile(
      path.join(__dirname, "..", "data", filename),
      JSON.stringify(data),
      (err, content) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

async function getById(filename, id) {
  if (!filename || !id) return {};
  return getAll(filename).then((data) => data.find((el) => el["id"] === id));
}

export default {
  writeToFile,
  getAll,
  getById,
};
