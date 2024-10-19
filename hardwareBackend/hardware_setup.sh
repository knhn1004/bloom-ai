# Activate the conda environment named 'bloom'
# Attach the USB device with busid 2-1 to WSL

usbipd attach --wsl --busid 2-1

wsl

conda activate bloom

# Run the main Python script
python main.py
