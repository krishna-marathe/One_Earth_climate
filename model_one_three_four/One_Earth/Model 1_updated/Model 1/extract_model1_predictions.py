import subprocess
import os
import sys

# Get the current script folder
script_dir = os.path.dirname(os.path.abspath(__file__))

# Dataset path (update if your CSV is in a different folder)
dataset_path = os.path.join(script_dir, "smart_synthetic_climate_10k.csv")

# Full path to main.py
main_py_path = os.path.join(script_dir, "main.py")

# Check if files exist
if not os.path.exists(dataset_path):
    print(f"❌ Dataset not found: {dataset_path}")
    sys.exit(1)

if not os.path.exists(main_py_path):
    print(f"❌ main.py not found: {main_py_path}")
    sys.exit(1)

# Run main.py without capturing output to prevent hanging
try:
    subprocess.run(
        ["python", main_py_path, dataset_path],
        check=True
    )
except subprocess.CalledProcessError as e:
    print("❌ Error running main.py:")
    print(e)
    sys.exit(1)
