import json
import requests

def lambda_handler(event, context):
    print(">> Incoming event:", json.dumps(event))

    try:
        http_method = event.get("httpMethod", "")
        headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
        query_params = event.get("queryStringParameters") or {}

        # Handle CORS preflight
        if http_method == "OPTIONS":
            requested_headers = headers.get("access-control-request-headers", "Authorization, Content-Type, Accept-Language, Accept-Locale")
            return {
                "statusCode": 204,
                "headers": {
                    **cors_headers(requested_headers),
                    "Content-Length": "0"
                },
                "body": ""
            }

        if http_method != "GET":
            return error_response(405, f"Method {http_method} not allowed")

        path = query_params.get("path")
        if not path:
            return error_response(400, "Missing `path` query parameter")

        token = headers.get("authorization")
        if not token:
            return error_response(401, "Missing Authorization header")

        if not path.startswith("1/user/"):
            path = f"1/user/-/{path}"

        fitbit_url = f"https://api.fitbit.com/{path}"
        print(f">> Forwarding to Fitbit: {fitbit_url}")

        forward_headers = {"Authorization": token}
        if "accept-language" in headers:
            forward_headers["Accept-Language"] = headers["accept-language"]
        if "accept-locale" in headers:
            forward_headers["Accept-Locale"] = headers["accept-locale"]

        try:
            response = requests.get(fitbit_url, headers=forward_headers)
            print(f">> Fitbit {response.status_code}: {response.text[:300]}")

            if response.status_code >= 400:
                return error_response(response.status_code, f"Fitbit error: {response.text}")

            return {
                "statusCode": response.status_code,
                "headers": {
                    **cors_headers(),
                    "Content-Type": response.headers.get("Content-Type", "application/json")
                },
                "body": response.text
            }

        except requests.exceptions.RequestException as e:
            print(f">> Requests error: {str(e)}")
            return error_response(502, f"Fitbit request failed: {str(e)}")

    except Exception as e:
        print(f">> Uncaught exception: {e}")
        return error_response(500, f"Unhandled error: {str(e)}")

def cors_headers(requested_headers=None):
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": requested_headers or "Authorization, Content-Type, Accept-Language, Accept-Locale",
        "Access-Control-Max-Age": "86400"
    }

def error_response(status, message):
    return {
        "statusCode": status,
        "headers": {
            **cors_headers(),
            "Content-Type": "application/json"
        },
        "body": json.dumps({"error": message})
    }
