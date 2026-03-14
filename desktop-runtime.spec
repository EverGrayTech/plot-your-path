import sys
from pathlib import Path

from PyInstaller.utils.hooks import collect_submodules

project_root = Path.cwd().resolve()
sys.path.insert(0, str(project_root / "src"))

hiddenimports = collect_submodules("backend")

a = Analysis(
    [str(project_root / "src" / "backend" / "desktop_runtime.py")],
    pathex=[str(project_root / "src")],
    binaries=[],
    datas=[(str(project_root / "config"), "config")],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="plot-your-path-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
)
