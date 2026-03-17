import os
import sys

def main():
    print("--------------------------------------------------")
    print("Layer 3 (Execution) - Script Running Successfully")
    print("--------------------------------------------------")
    print(f"Python Version: {sys.version}")
    print(f"Current Directory: {os.getcwd()}")
    print("--------------------------------------------------")
    print("This script simulates a deterministic task.")
    print("In a real scenario, this would be doing actual work")
    print("like API calls, data processing, or file I/O.")
    print("--------------------------------------------------")

if __name__ == "__main__":
    main()
