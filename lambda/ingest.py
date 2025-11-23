import json
import os
import datetime
import boto3

s3 = boto3.client("s3")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "")

def handler(event, context):
    try:
        # Body from API Gateway
        body = event.get("body") or "{}"
        data = json.loads(body)

        # Add server timestamp
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"

        # Simple validation
        event_id = data.get("eventId", "unknown-event")
        student_id = data.get("studentId", "unknown-student")

        record = {
            "eventId": event_id,
            "studentId": student_id,
            "receivedAt": timestamp,
            "raw": data,
        }

        # Key in S3
        key = f"events/checkin_{timestamp}.json"

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps(record),
            ContentType="application/json",
        )

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"ok": True, "message": "Saved", "key": key}),
        }

    except Exception as e:
        print("ERROR:", e)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"ok": False, "error": str(e)}),
        }

