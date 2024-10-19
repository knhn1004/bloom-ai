# Activate the conda environment named 'bloom'
# Attach the USB device with busid 2-1 to WSL

usbipd attach --wsl --busid 2-1

wsl

conda activate bloom

# Navigate to the hardwareBackend directory
cd hardwareBackend
# Run the main Python script
python main.py
