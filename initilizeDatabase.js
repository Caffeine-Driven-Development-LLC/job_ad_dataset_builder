import {open} from "sqlite";
import sqlite3 from "sqlite3";

const defaultFilePath = '/Users/ianmcnaughton/Documents/careerListing.sqlite'

export async function initializeDatabase(filePath){
  return open({
    filename: filePath || defaultFilePath,
    driver: sqlite3.Database
  }).then(async (db) => {
    db.run('PRAGMA foreign_keys = ON')
    return db
  })
}