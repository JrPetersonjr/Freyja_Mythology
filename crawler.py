import os
from pathlib import Path

def crawl_folder_to_text(folder_path, output_file="output.txt"):
    """Recursively crawls a folder and writes contents to a text file."""
    with open(output_file, "w", encoding="utf-8") as out_f:
        for root, _, files in os.walk(folder_path):
            for filename in files:
                full_path = os.path.join(root, filename)
                line = f"{full_path}\n"   # Write each file path
                out_f.write(line)

    print(f"Crawling complete. Results saved to: {output_file}")

# Example usage:
folder_to_scan = Path(".")  # Replace with your folder path
crawl_folder_to_text(folder_to_scan)