import os
import boto3
import json

client = boto3.client(
    "bedrock-runtime",
    region_name=os.environ.get("AWS_DEFAULT_REGION", "us-west-2"),
)

def prompt(messages, system="You are a helpful assistant."):
    response = client.invoke_model(
        modelId="us.anthropic.claude-sonnet-4-5-20250929-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system,
            "messages": messages
        })
    )
    result = json.loads(response["body"].read())
    return result["content"][0]["text"]
