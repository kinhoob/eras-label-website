import json
from pathlib import Path

path = Path('/home/ubuntu/eras-label-website/.manus-logs/networkRequests.log')
for line in path.read_text(errors='replace').splitlines():
    if 'admin.getAnalytics' not in line:
        continue
    try:
        record = json.loads(line.split('] ', 1)[1])
        names = record.get('url', '').split('/api/trpc/', 1)[-1].split('?', 1)[0].split(',')
        body = (record.get('response') or {}).get('body')
        if isinstance(body, str):
            try:
                body = json.loads(body)
            except Exception:
                pass
        print('\nTIME', line[:24], 'STATUS', (record.get('response') or {}).get('status'), 'DURATION', record.get('duration'))
        if isinstance(body, list):
            for name, item in zip(names, body):
                if name not in {'admin.getAnalytics', 'admin.aiSummary'}:
                    continue
                result = item.get('result', {}) if isinstance(item, dict) else {}
                if 'error' in result:
                    print(name, 'ERROR', result.get('error'))
                else:
                    data = result.get('data', {})
                    if isinstance(data, dict) and 'json' in data:
                        payload = data['json']
                        print(name, 'OK_KEYS', list(payload.keys()) if isinstance(payload, dict) else type(payload).__name__, 'SUMMARY', payload.get('summary') if isinstance(payload, dict) else payload)
                    else:
                        print(name, 'RESULT', str(result)[:500])
        else:
            print('BODY_TYPE', type(body).__name__, str(body)[:1000])
    except Exception as exc:
        print('PARSE_ERROR', exc, line[:300])
