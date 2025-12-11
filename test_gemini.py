#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Gemini API 연결 테스트 스크립트"""

import os
import ssl
import warnings

# SSL 우회 설정
os.environ['GRPC_VERBOSITY'] = 'NONE'
os.environ['GRPC_TRACE'] = ''
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_SSL_CIPHER_SUITES'] = 'HIGH+ECDSA'
os.environ['GRPC_DEFAULT_SSL_ROOTS_FILE_PATH'] = ''
os.environ['SSL_CERT_FILE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

# urllib3 SSL 경고 비활성화
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from dotenv import load_dotenv
load_dotenv('backend/.env')

import requests

def test_api():
    api_key = os.getenv('GOOGLE_API_KEY')
    print(f"API Key: {api_key[:15]}..." if api_key else "API Key: NOT SET")
    
    if not api_key:
        print("ERROR: GOOGLE_API_KEY not found in environment")
        return
    
    model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
    
    print(f"\n1. Testing direct REST API call (verify=False)...")
    print(f"2. Model: {model_name}")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Respond with just: OK"}
                ]
            }
        ]
    }
    
    print("3. Sending request with SSL verification disabled...")
    try:
        response = requests.post(url, json=payload, verify=False, timeout=30)
        print(f"4. Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No text')
            print(f"5. SUCCESS! Response: {text}")
        else:
            print(f"5. FAILED! Response: {response.text}")
    except Exception as e:
        print(f"4. FAILED! Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api()
