
## Getting Started

First, run the development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Docker

docker build -t jack-web .  

docker run -p 8080:8080 jack-web

## test api

curl -X 'POST' \
  'https://URL/api/echo' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "message": "help"
}'

## Deploy to goofg cloud run


gcloud auth login
gcloud config set project PROJECT_ID


gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/my-repo/mv
jack-web .



gcloud run deploy jack-web --image us-central1-docker.pkg.dev/PROJECT_ID/my-repo/jack-web --platform managed --region us-central1 --allow-unauthenticated