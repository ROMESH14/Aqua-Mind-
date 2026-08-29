const mysql = require('mysql2/promise');

let pool = null;

function getConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'myaqua',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000,
  };
}

async function getMysqlPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(getConfig());
      await pool.query('SELECT 1');
      await ensureSchema(pool);
    } catch (err) {
      pool = null;
      const nested = err.errors?.[0];
      const code = err.code || nested?.code;
      let message = err.message || nested?.message || 'Database connection failed';
      if (code === 'ECONNREFUSED') {
        message = 'Cannot connect to MySQL. Open WAMP/XAMPP and start MySQL, then restart the backend.';
      } else if (code === 'ER_ACCESS_DENIED_ERROR') {
        message = 'MySQL login failed. Check DB_USER and DB_PASSWORD in backend/.env.';
      } else if (code === 'ER_BAD_DB_ERROR') {
        message = `Database "${getConfig().database}" not found. Create it in phpMyAdmin first.`;
      }
      const error = new Error(message);
      error.status = 503;
      error.code = code;
      throw error;
    }
  }
  return pool;
}

async function ensureSchema(db) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS Users (
      UserID INT AUTO_INCREMENT PRIMARY KEY,
      Username VARCHAR(100) NOT NULL UNIQUE,
      Email VARCHAR(191) NOT NULL UNIQUE,
      PasswordHash VARCHAR(255) NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Tanks (
      TankID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      Name VARCHAR(255) NOT NULL,
      VolumeLiters INT NULL,
      TankType VARCHAR(100) NULL,
      FishCount INT NOT NULL DEFAULT 0,
      PlantCount INT NOT NULL DEFAULT 0,
      FishNames TEXT NULL,
      PlantNames TEXT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS WaterReadings (
      ReadingID INT AUTO_INCREMENT PRIMARY KEY,
      TankID INT NOT NULL,
      pH DECIMAL(4,2) NULL,
      Temperature DECIMAL(4,1) NULL,
      Ammonia DECIMAL(6,3) NULL,
      Nitrite DECIMAL(6,3) NULL,
      Nitrate DECIMAL(6,1) NULL,
      DissolvedO2 DECIMAL(4,1) NULL,
      RecordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS MaintenanceTasks (
      TaskID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TankID INT NULL,
      TaskName VARCHAR(255) NOT NULL,
      DueDate DATE NOT NULL,
      DueTime VARCHAR(20) NULL,
      NotifiedAt DATETIME NULL,
      IsCompleted TINYINT(1) NOT NULL DEFAULT 0,
      CompletedAt DATETIME NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS MaintenanceLogs (
      LogID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TankID INT NULL,
      TaskName VARCHAR(255) NOT NULL,
      DurationMinutes INT NULL,
      Notes TEXT NULL,
      CompletedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Alerts (
      AlertID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TankID INT NULL,
      AlertType VARCHAR(50) NOT NULL,
      Title VARCHAR(255) NOT NULL,
      Detail TEXT NULL,
      IsRead TINYINT(1) NOT NULL DEFAULT 0,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS GrowthRecords (
      GrowthID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TankID INT NOT NULL,
      FishName VARCHAR(255) NOT NULL,
      LengthCm DECIMAL(6,2) NOT NULL,
      WeightG DECIMAL(8,2) NULL,
      Notes TEXT NULL,
      RecordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Equipment (
      EquipmentID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TankID INT NULL,
      Name VARCHAR(255) NOT NULL,
      Type VARCHAR(50) NOT NULL,
      Brand VARCHAR(255) NULL,
      Status VARCHAR(50) NOT NULL DEFAULT 'Working',
      Notes TEXT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (TankID) REFERENCES Tanks(TankID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS SavedPlans (
      PlanID INT AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      Kind VARCHAR(40) NOT NULL DEFAULT 'plants',
      Title VARCHAR(255) NOT NULL,
      SearchText TEXT NULL,
      FormJSON LONGTEXT NOT NULL,
      ResultJSON LONGTEXT NOT NULL,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )`,
  ];

  for (const sql of statements) {
    await db.query(sql);
  }

  await addColumnIfMissing(db, 'Tanks', 'FishNames', 'TEXT NULL');
  await addColumnIfMissing(db, 'Tanks', 'PlantNames', 'TEXT NULL');
  await addColumnIfMissing(db, 'Alerts', 'IsRead', 'TINYINT(1) NOT NULL DEFAULT 0');
  await addColumnIfMissing(db, 'MaintenanceTasks', 'NotifiedAt', 'DATETIME NULL');
  await db.query('ALTER TABLE Equipment MODIFY Notes MEDIUMTEXT NULL').catch(() => {});
}

async function addColumnIfMissing(db, table, column, definition) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (!rows.length) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

module.exports = { getMysqlPool, getConfig };
