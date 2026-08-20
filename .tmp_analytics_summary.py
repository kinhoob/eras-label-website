import json
from pathlib import Path

records = []
for line in Path('/home/ubuntu/eras-label-website/.manus-logs/networkRequests.log').read_text(errors='replace').splitlines():
    if 'admin.getAnalytics' not in line:
        continue
    try:
        record = json.loads(line.split('] ', 1)[1])
        response = record.get('response') or {}
        body = response.get('body')
        if isinstance(body, str):
            body_json = json.loads(body)
        else:
            body_json = body
        names = record.get('url', '').split('/api/trpc/', 1)[-1].split('?', 1)[0].split(',')
        entry = {'time': line[1:24], 'duration': record.get('duration'), 'status': response.get('status'), 'items': []}
        if isinstance(body_json, list):
            for name, item in zip(names, body_json):
                if name == 'admin.getAnalytics':
                    result = item.get('result', {}) if isinstance(item, dict) else {}
                    if 'error' in result:
                        entry['items'].append({'name': name, 'error': result['error']})
                    else:
                        payload = result.get('data', {}).get('json')
                        entry['items'].append({'name': name, 'period': (payload or {}).get('period') if isinstance(payload, dict) else None, 'summary': (payload or {}).get('summary') if isinstance(payload, dict) else None})
        records.append(entry)
    except Exception as exc:
        records.append({'parse_error': str(exc)})
for item in records[-12:]:
    print(json.dumps(item, ensure_ascii=False, default=str))
