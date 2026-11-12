import pathlib, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent  # env root
py, wheels = sys.executable, root / "wheels"
scripts, req = root / "scripts", root / "backend" / "requirements.txt"


def run(*args):
    r = subprocess.run([py, "-s", *args])
    sys.exit(r.returncode) if r.returncode else None


run(str(scripts / "get-pip.py"), "--no-index", "--find-links", str(wheels))
run("-m", "pip", "install", "--no-index", "--find-links", str(wheels), "-r", str(req))
print("DEPS_OK")
