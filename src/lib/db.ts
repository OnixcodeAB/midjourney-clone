// lib/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPromise = open({
  filename: path.join(process.cwd(),"src", "db", "data.sqlite"),
  driver: sqlite3.Database,
});

export default dbPromise;
