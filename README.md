
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Docker

docker build -t mvp-fe .  

docker run -p 8080:8080 mvp-fe

## test api

curl -X 'POST' \
  'https://xxx.dilly.cloud/api/echo' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "message": "help"
}'

## Deploy to goofg cloud run


gcloud auth login
gcloud config set project mvp-app-459119


gcloud builds submit --tag us-central1-docker.pkg.dev/mvp-app-459119/my-repo/mvp-fe .



gcloud run deploy mvp-fe --image us-central1-docker.pkg.dev/mvp-app-459119/my-repo/mvp-fe --platform managed --region us-central1 --allow-unauthenticated