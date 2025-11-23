## 🏗 ASCII Architecture Diagram

```text
                                +-----------------------------+
                                |     AWS CloudShell (AWS)    |
                                |  - cdk deploy               |
                                |  - aws s3 / aws athena      |
                                |  - git (GitHub)             |
                                +--------------+--------------+
                                               |
                                               | CDK (deploy stack)
                                               v
      +---------------------------------------------------------------------+
      |                           [ AWS Cloud (us-east-1) ]                 |
      |                                                                     |
      |   +---------------------+                +-----------------------+  |
      |   |  Amazon API Gateway |                |   Amazon Athena (AWS) |  |
      |   |      (REST API)     |                |   smart_campus DB     |  |
      |   |---------------------|                |-----------------------|  |
      |   |  POST /events       |                | Tables:               |  |
      |   |  POST /rooms        |                | - events_checkins     |  |
      |   +----------+----------+                | - rooms_usage         |  |
      |              |                           +-----------+-----------+  |
      |              | Invoke Lambdas                        |              |
      |              v                                       | Query JSON   |
      |   +--------------------------+                       |              |
      |   |   AWS Lambda (Python)    |                       |              |
      |   |--------------------------|                       |              |
      |   | ingest.py                |                       |              |
      |   | (/events/checkin)        |                       |              |
      |   +--------------------------+                       |              |
      |   +--------------------------+                       |              |
      |   |   AWS Lambda (Python)    |                       |              |
      |   |--------------------------|                       |              |
      |   | rooms_usage.py           |                       |              |
      |   | (/rooms/usage)           |                       |              |
      |   +-------------+------------+                       |              |
      |                 | Write JSON                         |              |
      |                 v                                     v             |
      |        +-------------------------------+                            |
      |        |     Amazon S3 (Data Lake)     |                            |
      |        | smartcampusstack-raw bucket   |                            |
      |        |------------------------------|                            |
      |        |  events/checkin_*.json       |                            |
      |        |  rooms/usage_*.json          |                            |
      |        |  testuploads/athena-results/ |<-- CSV query results       |
      |        +-------------------------------+                            |
      |                                                                     |
      |   (AWS IAM roles & policies allow:                                  |
      |    - API Gateway -> Lambda invoke                                   |
      |    - Lambda -> S3 write                                             |
      |    - Athena -> S3 read/write, etc.)                                 |
      +---------------------------------------------------------------------+

Client (outside AWS):
  - curl / Postman / browser
  - Sends HTTP requests to the API Gateway endpoints


# Smart Campus Serverless Data Platform (AWS)

A serverless data platform built on the AWS Free Tier using **AWS CloudShell** and **AWS CDK**.  
The system ingests campus-style data (event check-ins and room usage), stores it in **Amazon S3**, and analyzes it using **Amazon Athena** with SQL.

This project is designed as a portfolio-ready example of cloud, serverless, and data engineering skills.

---

## ✨ Key Features

- **Fully serverless architecture**
  - REST APIs with **Amazon API Gateway**
  - Compute with **AWS Lambda (Python)**
  - Storage in **Amazon S3** (data lake style)
- **Two ingestion endpoints**
  - `POST /events/checkin` – student event check-ins  
  - `POST /rooms/usage` – room utilization metrics
- **Analytics with Athena**
  - Athena database: `smart_campus`
  - Tables for event check-ins and room usage
  - Example SQL queries for:
    - Check-ins per event
    - Room usage and total people
- **Infrastructure as Code**
  - Entire stack defined using **AWS CDK (TypeScript)**
  - All work performed via **AWS CloudShell**

---

## 🧱 Architecture Overview

**Flow:**

1. Client sends HTTP request to API Gateway:
   - `POST /events/checkin`
   - `POST /rooms/usage`
2. API Gateway triggers the corresponding **Lambda** function (Python).
3. Lambda enriches the payload (e.g., adds server timestamp).
4. Lambda writes JSON files to an **S3 bucket**:
   - `events/` prefix for event check-ins
   - `rooms/` prefix for room usage
5. **Athena** reads the JSON data from S3 using external tables.
6. SQL queries generate analytics, with results stored as CSV in S3 and downloaded from CloudShell.

**AWS services used:**

- AWS CloudShell  
- AWS CDK (TypeScript)  
- Amazon API Gateway  
- AWS Lambda (Python 3.11)  
- Amazon S3  
- Amazon Athena  
- AWS Identity and Access Management (IAM)  

---

## 📁 Project Structure

```text
smart-campus/
├── bin/
│   └── smart-campus.ts           # CDK app entrypoint
├── lib/
│   └── smart-campus-stack.ts     # CDK stack: S3, Lambda, API Gateway
├── lambda/
│   ├── ingest.py                 # /events/checkin Lambda handler
│   └── rooms_usage.py            # /rooms/usage Lambda handler
├── test/
├── package.json
├── tsconfig.json
└── README.md

1. Install dependencies (first time)

From CloudShell:

cd ~/smart-campus
npm install
npm install aws-cdk-lib constructs

2. Build the CDK app
npm run build

3. Bootstrap CDK (first time per account/region)
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION

4. Deploy the stack
cdk deploy


Confirm with y when prompted.

At the end of deployment you’ll see outputs similar to:

SmartCampusStack.CheckinUrl = https://...execute-api....amazonaws.com/prod/events/checkin
SmartCampusStack.RoomsUsageUrl = https://...execute-api....amazonaws.com/prod/rooms/usage

🔌 API Usage

Replace with the actual URLs from cdk deploy:

CHECKIN_URL="https://.../prod/events/checkin"
ROOMS_URL="https://.../prod/rooms/usage"

Event Check-in – POST /events/checkin
curl -X POST "$CHECKIN_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-001",
    "studentId": "stu-123",
    "note": "First test check-in"
  }'


Sample response:

{"ok": true, "message": "Saved", "key": "events/checkin_2025-11-23T14:41:38.826632Z.json"}

Room Usage – POST /rooms/usage
curl -X POST "$ROOMS_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "lab-101",
    "startTime": "2025-11-23T14:00:00Z",
    "endTime": "2025-11-23T16:00:00Z",
    "peopleCount": 18
  }'


Sample response:

{"ok": true, "message": "Room usage saved", "key": "rooms/usage_2025-11-23T14:57:31.891919Z.json"}

🗂 S3 Data Layout

Example bucket layout:

smartcampusstack-raweventbucketXXXXXXXXXXXX/

  events/
    checkin_2025-11-23T14:41:38.826632Z.json
    checkin_2025-11-23T14:44:18.611148Z.json
    ...

  rooms/
    usage_2025-11-23T14:57:31.891919Z.json
    ...


Each file contains structured fields (eventId, studentId, roomId, etc.) and a receivedAt timestamp, plus the original raw payload.

📊 Analytics with Athena
Configure Athena output
export BUCKET="<YOUR_BUCKET_NAME>"
export ATHENA_OUTPUT="s3://$BUCKET/testuploads/athena-results/"

Create database
aws athena start-query-execution \
  --query-string "CREATE DATABASE IF NOT EXISTS smart_campus;" \
  --query-execution-context Database="default" \
  --result-configuration "OutputLocation=$ATHENA_OUTPUT"

Example table definitions (run as Athena SQL)

Room usage table

CREATE EXTERNAL TABLE IF NOT EXISTS smart_campus.rooms_usage (
  roomId        string,
  startTime     string,
  endTime       string,
  peopleCount   int,
  receivedAt    string,
  raw           string
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://<YOUR_BUCKET_NAME>/rooms/';


Event check-ins table

CREATE EXTERNAL TABLE IF NOT EXISTS smart_campus.events_checkins (
  eventId      string,
  studentId    string,
  receivedAt   string,
  raw          string
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://<YOUR_BUCKET_NAME>/events/';

Example queries

Room usage summary

SELECT
  roomId,
  COUNT(*) AS usage_records,
  SUM(peopleCount) AS total_people
FROM rooms_usage
GROUP BY roomId;


Event attendance

SELECT
  eventId,
  COUNT(*) AS checkins
FROM events_checkins
GROUP BY eventId
ORDER BY checkins DESC;


Query results are written to S3 as CSV under $ATHENA_OUTPUT and can be downloaded from CloudShell.

✅ What This Project Demonstrates

Practical use of AWS CloudShell as a full cloud development environment.

Infrastructure as Code with AWS CDK (TypeScript).

Serverless APIs using API Gateway and Lambda (Python).

Data lake pattern using S3 prefixes for different domains.

Analytics on JSON data using Athena and SQL.

A realistic, end-to-end project suitable for:

coursework / assignments

cloud or data engineering portfolios

junior cloud / DevOps roles




1. Scroll down to the **“Commit changes”** section.
2. In the message box, type:  
   `Update README for Smart Campus project`
3. Make sure **“Commit directly to the main branch”** is selected.
4. Click the green **“Commit changes”** button.
