import requests
import time
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

load_dotenv()

THINKSPEAK_URL = os.getenv("IOT_ENDPOINT")

def fetch_data():
    response = requests.get(THINKSPEAK_URL)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

def get_last_processed_entry():
    last_processed_doc = db.collection('metadata').document('last_processed_entry').get()
    if last_processed_doc.exists:
        return last_processed_doc.to_dict().get('entry_id', 0)
    return 0

def update_last_processed_entry(entry_id):
    db.collection('metadata').document('last_processed_entry').set({'entry_id': entry_id})

def update_firestore(data):
    if data and 'feeds' in data:
        last_processed_id = get_last_processed_entry()
        new_entries = [feed for feed in data['feeds'] if int(feed['entry_id']) > last_processed_id]
        
        for feed in new_entries:
            doc_ref = db.collection('iot_data').document(str(feed['entry_id']))
            
            try:
                timestamp = datetime.strptime(feed['created_at'], "%Y-%m-%dT%H:%M:%SZ")
                doc_data = {
                    'timestamp': timestamp,
                    'temperature': parse_float(feed['field3']),
                    'humidity': parse_float(feed['field1']),
                    'light_intensity': parse_float(feed['field4']),
                    'soil_moisture': parse_int(feed['field5'])
                }
                doc_ref.set(doc_data)
                print(f"Updated Firestore with entry_id: {feed['entry_id']}")
            except ValueError as e:
                print(f"Error parsing data for entry_id {feed['entry_id']}: {str(e)}")
            except Exception as e:
                print(f"Error updating Firestore for entry_id {feed['entry_id']}: {str(e)}")
        
        if new_entries:
            update_last_processed_entry(int(new_entries[-1]['entry_id']))
    else:
        print("No data to update")

def parse_float(value):
    try:
        return float(value)
    except ValueError:
        return None

def parse_int(value):
    try:
        return int(value)
    except ValueError:
        return None

def main():
    while True:
        data = fetch_data()
        if data:
            update_firestore(data)
        time.sleep(60)

if __name__ == "__main__":
    main()
