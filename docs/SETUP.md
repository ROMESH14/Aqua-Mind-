# Aqua Mind setup

## Run from VS Code / Cursor (recommended)

1. Open this folder in **VS Code** or **Cursor**
2. Open **Run and Debug** (Ctrl+Shift+D)
3. Select **Aqua Mind (Full Stack)** from the dropdown
4. Press **F5**

This starts the backend (5005), frontend (3003), and AI engine (5001) in one terminal.

Then open http://localhost:3003

**First time only** — install dependencies from the project root:

```cmd
npm install --prefix backend
npm install --prefix frontend
```

**Before each run:** start **MySQL** in WAMP/XAMPP (green icon) if `backend/.env` uses `DB_DRIVER=mysql`.

Optional: use **Aqua Mind + Browser** to launch the app and open Chrome automatically.

## Run from Visual Studio

1. Open **`AquaMind.sln`** in Visual Studio 2022
2. Set **AquaMind.Launcher** as the startup project (right-click → Set as Startup Project)
3. Press **F5** or click the green **Start** button

One console window starts the backend, frontend, and AI engine, then opens http://localhost:3003.

## Run without an IDE

Double-click **`Launch AquaMind.bat`**, or from the project root:

```cmd
npm run dev
```

Or with the .NET launcher:

```cmd
dotnet run --project AquaMind.Launcher
```

## Requirements

- [Node.js](https://nodejs.org/) (includes npm)
- [.NET 8 SDK](https://dotnet.microsoft.com/download) (for the launcher)
- [Python 3](https://python.org/) (for the AI engine)

## URLs

| Service    | URL                        |
|------------|----------------------------|
| Website    | http://localhost:3003/     |
| API        | http://localhost:5005      |
| AI Engine  | http://localhost:5001      |

## Database options

Aqua Mind supports three databases. **SQLite is the default** — no phpMyAdmin setup needed.

### Option A — SQLite (easiest, default)

Data is stored automatically in `backend/data/aquamind.db`. Tables are created on first run.

In `backend/.env`:
```
DB_DRIVER=sqlite
```

### Option B — MySQL / phpMyAdmin

1. Open **phpMyAdmin** → **Databases**
2. Create database name **`aquamind`** (no spaces at the end — `aqua_mind ` will fail)
3. Collation: `utf8mb4_unicode_ci`
4. Open the **SQL** tab and run `backend/database/mysql-setup.sql`  
   (or let the app create tables automatically on start)
5. Edit `backend/.env`:

```
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=aquamind
```

6. Restart the backend (`npm run start:backend`)

When you use the app (sign up, add tanks, log water readings), data is saved to these MySQL tables and visible in phpMyAdmin.

### Option C — SQL Server

Set `DB_DRIVER=mssql` and configure `DB_SERVER`, `DB_DATABASE` in `backend/.env`.

## AI / ML training (optional)

The Python AI engine (`ai-engine/`) can use **real data** from your database to train models for water forecasts, fish, and plant recommendations.

1. Log water readings in the app (stored in `WaterReadings`)
2. Export CSVs:
   ```cmd
   cd ai-engine
   pip install -r requirements.txt
   python scripts/export_data.py
   ```
   Or export `WaterReadings` from phpMyAdmin to `ai-engine/data/water_readings.csv`
3. Copy and edit label templates:
   - `data/fish_labels.csv.template` → `data/fish_labels.csv`
   - `data/plant_labels.csv.template` → `data/plant_labels.csv`
4. Train:
   ```cmd
   python scripts/retrain_all.py
   ```
5. Restart the AI engine (`python app.py` or relaunch from Visual Studio)

Until models are trained, the AI Advisor uses rule-based fallbacks. See **`ai-engine/README.md`** for full details.

