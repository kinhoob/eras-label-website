import json
from pathlib import Path

path = Path('/home/ubuntu/eras-label-website/.manus-logs/networkRequests.log')
for line in path.read_text(errors='replace').splitlines():
    if 'getAnalytics' not in line and 'aiSummary' not in line:
        continue
    try:
        record = json.loads(line.split('] ', 1)[1])
        response = record.get('response') or {}
        print({
            'time': line[:24],
            'url': record.get('url', '')[:180],
            'status': response.get('status'),
            'duration': record.get('duration'),
            'error': record.get('error'),
            'body_head': str(response.get('body', ''))[:220],
        })
    except Exception as exc:
        print({'parse_error': str(exc), 'line_head': line[:180]})
