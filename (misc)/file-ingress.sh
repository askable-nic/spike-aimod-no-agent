export export $(cat ../.env.local | xargs);

export LIVEKIT_URL="$LK_SERVER_URL"
export LIVEKIT_API_KEY="$LK_API_KEY"
export LIVEKIT_API_SECRET="$LK_API_SECRET"

ROOM_NAME=$1
if [ -z "$ROOM_NAME" ]; then
  echo "Please provide a room name"
  exit 1
fi

INGRESS_JSON='{
  "input_type": "URL_INPUT",
  "name": "AI Agent",
  "room_name": "'$ROOM_NAME'",
  "participant_identity": "ai_agent",
  "participant_name": "AI Moderator",
  "url": "https://askable-misc-public.s3.ap-southeast-2.amazonaws.com/dashboard_sounds/eofy-yeah-boi.mp3"
}'

echo "'$INGRESS_JSON'"

# save INGRESS_JSON to file
echo "$INGRESS_JSON" > file-ingress.json

lk ingress create file-ingress.json