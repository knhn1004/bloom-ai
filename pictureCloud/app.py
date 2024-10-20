import os
import cv2
import cloudinary
import cloudinary.uploader
from flask import Flask, render_template, redirect, url_for, request
from dotenv import load_dotenv
from camera_utils import capture_image
import threading
import time

load_dotenv()

app = Flask(__name__)

# Cloudinary configuration
cloudinaryFolder = os.getenv('CLOUDINARY_FOLDER')
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

CAPTURE_FOLDER = 'static/captures'

# Ensure the folder exists
os.makedirs(CAPTURE_FOLDER, exist_ok=True)

latest_image_url = None

def upload_to_cdn(image_path):
    print(f"Uploading {image_path} to Cloudinary...")
    result = cloudinary.uploader.upload(image_path, folder=cloudinaryFolder)
    print(f"Upload result: {result}")
    return result.get("url")

def capture_and_upload():
    global latest_image_url
    while True:
        print("Capturing image...")
        image_path = capture_image()
        if image_path:
            print(f"Image captured: {image_path}")
            latest_image_url = upload_to_cdn(image_path)
            print(f"Latest image URL: {latest_image_url}")
        else:
            print("Failed to capture image.")
        time.sleep(30)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/latest_image')
def latest_image():
    return render_template('image.html', image_url=latest_image_url)

if __name__ == '__main__':
    print("Starting capture and upload thread...")
    capture_thread = threading.Thread(target=capture_and_upload, daemon=True)
    capture_thread.start()
    print("Starting Flask app...")
    app.run(debug=False)
