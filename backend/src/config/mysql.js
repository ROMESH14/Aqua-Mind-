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
  ];

  for (const sql of statements) {
    await db.query(sql);
  }
}

module.exports = { getMysqlPool, getConfig };
