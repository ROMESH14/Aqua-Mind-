using System.Diagnostics;
using System.Net.Http;

const string appUrl = "http://localhost:3003/";
const string apiUrl = "http://localhost:5000";
const string aiUrl = "http://localhost:5001";

var root = FindRepoRoot();
var backendDir = Path.Combine(root, "backend");
var frontendDir = Path.Combine(root, "frontend");
var aiDir = Path.Combine(root, "ai-engine");

FreePorts(3003, 5000, 5001);

EnsureNpmProject(backendDir, "backend");
EnsureNpmProject(frontendDir, "frontend");
EnsureBackendEnv(backendDir);
EnsureAiEngine(aiDir);

Console.WriteLine("Starting Aqua Mind...");
Console.WriteLine($"  Home:      {appUrl}");
Console.WriteLine($"  API:       {apiUrl}");
Console.WriteLine($"  AI Engine: {aiUrl}");
Console.WriteLine();

using var backend = StartNpm("run dev", backendDir, new Dictionary<string, string?>
{
    ["PORT"] = "5000",
    ["AI_ENGINE_URL"] = aiUrl,
});

using var frontend = StartNpm("start", frontendDir, new Dictionary<string, string?>
{
    ["PORT"] = "3003",
    ["BROWSER"] = "none",
    ["REACT_APP_API_URL"] = $"{apiUrl}/api",
});

using var aiEngine = StartPython(aiDir);

Console.WriteLine("Waiting for the home page to be ready...");
if (await WaitForUrlReady(appUrl, TimeSpan.FromSeconds(90)))
{
    try
    {
        Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
        Console.WriteLine($"Opened {appUrl}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not open browser automatically: {ex.Message}");
        Console.WriteLine($"Open {appUrl} manually.");
    }
}
else
{
    Console.WriteLine($"Home page did not start in time. Open {appUrl} manually once you see 'Compiled successfully'.");
}

Console.WriteLine();
Console.WriteLine("Aqua Mind is running. Press Enter here to stop all services.");
Console.ReadLine();

static async Task<bool> WaitForUrlReady(string url, TimeSpan timeout)
{
    using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(4) };
    var deadline = DateTime.UtcNow + timeout;

    while (DateTime.UtcNow < deadline)
    {
        try
        {
            using var response = await client.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
        }
        catch
        {
            // Server still starting.
        }

        Console.WriteLine($"  still waiting for {url}...");
        await Task.Delay(TimeSpan.FromSeconds(2));
    }

    return false;
}

static void FreePorts(params int[] ports)
{
    foreach (var port in ports)
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "powershell",
                Arguments = $"-NoProfile -Command \"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}\"",
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(startInfo);
            process?.WaitForExit(8000);
        }
        catch
        {
            // Best effort only.
        }
    }
}

static string FindRepoRoot()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);

    while (dir is not null)
    {
        if (File.Exists(Path.Combine(dir.FullName, "AquaMind.sln")))
        {
            return dir.FullName;
        }

        dir = dir.Parent;
    }

    throw new InvalidOperationException("Could not find AquaMind.sln. Open the solution from the repo root.");
}

static void EnsureBackendEnv(string backendDir)
{
    var envPath = Path.Combine(backendDir, ".env");
    var examplePath = Path.Combine(backendDir, ".env.example");

    if (File.Exists(envPath))
    {
        return;
    }

    if (!File.Exists(examplePath))
    {
        throw new FileNotFoundException("Missing backend/.env.example", examplePath);
    }

    File.Copy(examplePath, envPath);
    Console.WriteLine("Created backend/.env from .env.example");
}

static void EnsureAiEngine(string aiDir)
{
    if (!Directory.Exists(aiDir))
    {
        throw new DirectoryNotFoundException($"Missing ai-engine folder: {aiDir}");
    }

    if (!File.Exists(Path.Combine(aiDir, "app.py")))
    {
        throw new FileNotFoundException("Missing ai-engine/app.py", Path.Combine(aiDir, "app.py"));
    }
}

static void EnsureNpmProject(string directory, string name)
{
    if (!Directory.Exists(directory))
    {
        throw new DirectoryNotFoundException($"Missing {name} folder: {directory}");
    }

    if (!File.Exists(Path.Combine(directory, "package.json")))
    {
        throw new FileNotFoundException($"Missing package.json in {name}.", Path.Combine(directory, "package.json"));
    }

    if (!Directory.Exists(Path.Combine(directory, "node_modules")))
    {
        Console.WriteLine($"Installing npm packages for {name}...");
        RunNpmOnce("install", directory);
    }
}

static void RunNpmOnce(string arguments, string workingDirectory)
{
    using var install = StartNpm(arguments, workingDirectory, null, waitForExit: true);
    if (install.ExitCode != 0)
    {
        throw new InvalidOperationException($"npm {arguments} failed in {workingDirectory} (exit {install.ExitCode}).");
    }
}

static ManagedProcess StartNpm(
    string arguments,
    string workingDirectory,
    IReadOnlyDictionary<string, string?>? extraEnv,
    bool waitForExit = false)
{
    var npm = FindNpmExecutable();
    var startInfo = new ProcessStartInfo
    {
        FileName = npm,
        Arguments = arguments,
        WorkingDirectory = workingDirectory,
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = false,
    };

    foreach (var pair in Environment.GetEnvironmentVariables().Cast<System.Collections.DictionaryEntry>())
    {
        var key = pair.Key?.ToString();
        if (!string.IsNullOrEmpty(key))
        {
            startInfo.Environment[key] = pair.Value?.ToString();
        }
    }

    if (extraEnv is not null)
    {
        foreach (var pair in extraEnv)
        {
            startInfo.Environment[pair.Key] = pair.Value;
        }
    }

    var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
    process.OutputDataReceived += (_, e) => { if (e.Data is not null) Console.WriteLine(e.Data); };
    process.ErrorDataReceived += (_, e) => { if (e.Data is not null) Console.WriteLine(e.Data); };

    if (!process.Start())
    {
        throw new InvalidOperationException($"Failed to start npm in {workingDirectory}.");
    }

    process.BeginOutputReadLine();
    process.BeginErrorReadLine();

    if (waitForExit)
    {
        process.WaitForExit();
        return new ManagedProcess(process, disposeOnExit: true);
    }

    return new ManagedProcess(process, disposeOnExit: true);
}

static ManagedProcess StartPython(string workingDirectory)
{
    var python = FindPythonExecutable(workingDirectory);
    var startInfo = new ProcessStartInfo
    {
        FileName = python,
        Arguments = "app.py",
        WorkingDirectory = workingDirectory,
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = false,
    };

    foreach (var pair in Environment.GetEnvironmentVariables().Cast<System.Collections.DictionaryEntry>())
    {
        var key = pair.Key?.ToString();
        if (!string.IsNullOrEmpty(key))
        {
            startInfo.Environment[key] = pair.Value?.ToString();
        }
    }

    var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
    process.OutputDataReceived += (_, e) => { if (e.Data is not null) Console.WriteLine(e.Data); };
    process.ErrorDataReceived += (_, e) => { if (e.Data is not null) Console.WriteLine(e.Data); };

    if (!process.Start())
    {
        throw new InvalidOperationException($"Failed to start Python in {workingDirectory}.");
    }

    process.BeginOutputReadLine();
    process.BeginErrorReadLine();

    return new ManagedProcess(process, disposeOnExit: true);
}

static string FindNpmExecutable()
{
    var pathEnv = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
    foreach (var folder in pathEnv.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
    {
        var candidate = Path.Combine(folder.Trim('"'), "npm.cmd");
        if (File.Exists(candidate))
        {
            return candidate;
        }
    }

    throw new FileNotFoundException("npm.cmd was not found. Install Node.js from https://nodejs.org/");
}

static string FindPythonExecutable(string aiDir)
{
    var venvPython = Path.Combine(aiDir, "venv", "Scripts", "python.exe");
    if (File.Exists(venvPython))
    {
        return venvPython;
    }

    var pathEnv = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
    foreach (var name in new[] { "python.exe", "python3.exe" })
    {
        foreach (var folder in pathEnv.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
        {
            var candidate = Path.Combine(folder.Trim('"'), name);
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }
    }

    throw new FileNotFoundException("Python was not found. Install Python from https://python.org/ or create ai-engine/venv");
}

sealed class ManagedProcess : IDisposable
{
    private readonly Process _process;
    private readonly bool _disposeOnExit;

    public int ExitCode => _process.HasExited ? _process.ExitCode : -1;

    public ManagedProcess(Process process, bool disposeOnExit)
    {
        _process = process;
        _disposeOnExit = disposeOnExit;
    }

    public void Dispose()
    {
        if (_process.HasExited)
        {
            if (_disposeOnExit)
            {
                _process.Dispose();
            }

            return;
        }

        try
        {
            _process.Kill(entireProcessTree: true);
        }
        catch
        {
            // Process may already be gone.
        }

        if (_disposeOnExit)
        {
            _process.Dispose();
        }
    }
}
