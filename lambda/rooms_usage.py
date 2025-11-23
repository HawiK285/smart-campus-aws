import json
import os
import datetime
import boto3

s3 = boto3.client("s3")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "")

def handler(event, context):
    try:
        body = event.get("body") or "{}"
        data = json.loads(body)

        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        room_id = data.get("roomId", "unknown-room")
        start_time = data.get("startTime", None)
        end_time = data.get("endTime", None)
        people_count = data.get("peopleCount", None)

        record = {
            "roomId": room_id,
            "startTime": start_time,
            "endTime": end_time,
            "peopleCount": people_count,
            "receivedAt": timestamp,
            "raw": data,
        }

        key = f"rooms/usage_{timestamp}.json"

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps(record),
            ContentType="application/json",
        )

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"ok": True, "message": "Room usage saved", "key": key}),
        }

    except Exception as e:
        print("ERROR:", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"ok": False, "error": str(e)}),
        }

