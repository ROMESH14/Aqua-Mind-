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
    FishNames TEXT,
    PlantNames TEXT,
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

  CREATE TABLE IF NOT EXISTS GrowthRecords (
    GrowthID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    TankID INTEGER NOT NULL REFERENCES Tanks(TankID) ON DELETE CASCADE,
    FishName TEXT NOT NULL,
    LengthCm REAL NOT NULL,
    WeightG REAL,
    Notes TEXT,
    RecordedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Equipment (
    EquipmentID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    TankID INTEGER REFERENCES Tanks(TankID) ON DELETE SET NULL,
    Name TEXT NOT NULL,
    Type TEXT NOT NULL,
    Brand TEXT,
    Status TEXT NOT NULL DEFAULT 'Working',
    Notes TEXT,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS SavedPlans (
    PlanID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    Kind TEXT NOT NULL DEFAULT 'plants',
    Title TEXT NOT NULL,
    SearchText TEXT,
    FormJSON TEXT NOT NULL,
    ResultJSON TEXT NOT NULL,
    CreatedAt TEXT DEFAULT (datetime('now'))
  );
`);

function addColumnIfMissing(table, column, definition) {
  const cols = db.pragma(`table_info(${table})`);
  if (!cols.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

addColumnIfMissing('Tanks', 'FishNames', 'TEXT');
addColumnIfMissing('Tanks', 'PlantNames', 'TEXT');

module.exports = db;
