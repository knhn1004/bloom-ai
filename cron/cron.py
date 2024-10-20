import requests
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

THINKSPEAK_URL = "https://api.thingspeak.com/channels/2703381/feeds.json?results=2"

def fetch_data():
    response = requests.get(THINKSPEAK_URL)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

def update_firestore(data):
    if data and 'feeds' in data:
        latest_feed = data['feeds'][-1]
        doc_ref = db.collection('iot_data').document(str(latest_feed['entry_id']))
        
        doc = doc_ref.get()
        if doc.exists:
            print(f"Entry with id {latest_feed['entry_id']} already exists. Skipping update.")
            return

        doc_ref.set({
            'timestamp': datetime.strptime(latest_feed['created_at'], "%Y-%m-%dT%H:%M:%SZ"),
            'temperature': float(latest_feed['field1']),
            'humidity': float(latest_feed['field2']),
            'light_intensity': float(latest_feed['field3']),
            'soil_moisture': int(latest_feed['field4'])
        })
        print(f"Updated Firestore with entry_id: {latest_feed['entry_id']}")
    else:
        print("No data to update")

def main():
    while True:
        data = fetch_data()
        if data:
            update_firestore(data)
        time.sleep(15)

if __name__ == "__main__":
    main()
