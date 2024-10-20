import os
import cv2
import cloudinary
import cloudinary.uploader
from flask import Flask, render_template, redirect, url_for, request
from dotenv import load_dotenv
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

def capture_image():
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        return None

    ret, frame = cam.read()
    if ret:
        image_path = os.path.join(CAPTURE_FOLDER, 'plant_capture.jpg')
        cv2.imwrite(image_path, frame)
        cam.release()
        return image_path
    else:
        cam.release()
        return None

def upload_to_cdn(image_path):
    result = cloudinary.uploader.upload(image_path)
    return result.get("url")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/capture', methods=['POST'])
def capture():
    image_path = capture_image()
    if image_path:
        image_url = upload_to_cdn(image_path)
        return redirect(url_for('show_image', image_url=image_url))
    return 'Failed to capture image', 500

@app.route('/image')
def show_image():
    image_url = request.args.get('image_url')
    return render_template('image.html', image_url=image_url)

if __name__ == '__main__':
    app.run(debug=True)
