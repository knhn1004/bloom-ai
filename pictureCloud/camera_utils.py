import os
import cv2

CAPTURE_FOLDER = 'static/captures'

# Ensure the folder exists
os.makedirs(CAPTURE_FOLDER, exist_ok=True)

def capture_image():
    cam = cv2.VideoCapture(1)

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


# capture_image()