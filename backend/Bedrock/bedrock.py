import boto3
import json

client = boto3.client("bedrock-runtime", region_name="us-east-1")

def prompt(messages, system="You are a helpful assistant."):
    response = client.invoke_model(
        modelId="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system,
            "messages": messages
        })
    )
    result = json.loads(response["body"].read())
    return result["content"][0]["text"]
