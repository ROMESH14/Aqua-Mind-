const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'aquamind.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Tanks (
    TankID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    Name TEXT NOT NULL,
    VolumeLiters INTEGER,
    TankType TEXT,
    FishCount INTEGER NOT NULL DEFAULT 0,
    PlantCount INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS WaterReadings (
    ReadingID INTEGER PRIMARY KEY AUTOINCREMENT,
    TankID INTEGER NOT NULL REFERENCES Tanks(TankID) ON DELETE CASCADE,
    pH REAL,
    Temperature REAL,
    Ammonia REAL,
    Nitrite REAL,
    Nitrate REAL,
    DissolvedO2 REAL,
    RecordedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS MaintenanceTasks (
    TaskID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    TankID INTEGER REFERENCES Tanks(TankID) ON DELETE SET NULL,
    TaskName TEXT NOT NULL,
    DueDate TEXT NOT NULL,
    DueTime TEXT,
    IsCompleted INTEGER NOT NULL DEFAULT 0,
    CompletedAt TEXT,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS MaintenanceLogs (
    LogID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    TankID INTEGER REFERENCES Tanks(TankID) ON DELETE SET NULL,
    TaskName TEXT NOT NULL,
    DurationMinutes INTEGER,
    Notes TEXT,
    CompletedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Alerts (
    AlertID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    TankID INTEGER REFERENCES Tanks(TankID) ON DELETE SET NULL,
    AlertType TEXT NOT NULL,
    Title TEXT NOT NULL,
    Detail TEXT,
    IsRead INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
