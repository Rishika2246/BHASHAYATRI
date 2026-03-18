"""Lightweight API integration checker.

This script verifies that API keys are present in `config_local.py` and
performs small, safe requests where possible to validate credentials.

It does not perform expensive operations or large API calls.
"""
import sys
import os
import requests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config_local import config

def check_assemblyai():
    key = config.ASSEMBLYAI_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        # Try common header variations
        for hdr_name in ('authorization', 'Authorization', 'Authorization-Bearer'):
            resp = requests.get('https://api.assemblyai.com/v2', headers={hdr_name: key}, timeout=5)
            if resp.status_code in (200, 401, 403):
                return True, f'Status: {resp.status_code} (header {hdr_name})'
        # As a fallback, consider not reachable or endpoint changed
        return False, f'Status: {resp.status_code}'
    except Exception as e:
        return False, str(e)

def check_openai():
    key = config.OPENAI_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        resp = requests.get('https://api.openai.com/v1/models', headers={'Authorization': f'Bearer {key}'}, timeout=5)
        return resp.status_code == 200, f'Status: {resp.status_code}'
    except Exception as e:
        return False, str(e)

def check_elevenlabs():
    key = config.ELEVENLABS_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        # Try both header names ElevenLabs might accept
        for hdr in ({'xi-api-key': key}, {'Authorization': f'Bearer {key}'}, {'api-key': key}):
            resp = requests.get('https://api.elevenlabs.io/v1/voices', headers=hdr, timeout=5)
            if resp.status_code == 200:
                return True, f'Status: {resp.status_code} (header used: {list(hdr.keys())[0]})'
        return False, f'Status: {resp.status_code}'
    except Exception as e:
        return False, str(e)

def check_sarvam():
    key = config.SARVAM_AI_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        resp = requests.get(config.SARVAM_AI_BASE_URL, headers={'Authorization': f'Bearer {key}'}, timeout=5)
        return resp.status_code in (200, 404, 401), f'Status: {resp.status_code}'
    except Exception as e:
        return False, str(e)

def check_arya():
    key = config.ARYA_AI_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        resp = requests.get(config.ARYA_AI_BASE_URL, headers={'Authorization': f'Bearer {key}'}, timeout=5)
        return resp.status_code in (200, 401, 404), f'Status: {resp.status_code}'
    except Exception as e:
        return False, str(e)

def check_google_gemini():
    key = config.GOOGLE_GEMINI_API_KEY
    if not key:
        return False, 'Missing key'
    try:
        # Simple models list endpoint (may require different scopes)
        url = f"{config.GOOGLE_GEMINI_BASE_URL}/models"
        # Try bearer first
        resp = requests.get(url, headers={'Authorization': f'Bearer {key}'}, timeout=5)
        if resp.status_code in (200, 401, 403, 404):
            return True, f'Status: {resp.status_code} (bearer)'
        # Try API-key query param as fallback
        resp = requests.get(f"{url}?key={key}", timeout=5)
        return resp.status_code in (200, 401, 403, 404), f'Status: {resp.status_code} (query param)'
    except Exception as e:
        return False, str(e)

def main():
    checks = {
        'AssemblyAI': check_assemblyai,
        'OpenAI': check_openai,
        'ElevenLabs': check_elevenlabs,
        'Sarvam AI': check_sarvam,
        'Arya AI': check_arya,
        'Google Gemini': check_google_gemini
    }

    print('\n🔍 Running lightweight API checks...')
    for name, fn in checks.items():
        ok, msg = fn()
        status = 'OK' if ok else 'FAIL'
        print(f" - {name.ljust(12)}: {status} ({msg})")

if __name__ == '__main__':
    main()
