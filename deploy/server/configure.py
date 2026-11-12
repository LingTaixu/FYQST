#!/usr/bin/env python3
"""Create host-specific runtime files while keeping the Git checkout clean."""
import gzip
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys

ROOT = Path('/srv/fyqst')
DEPLOY = ROOT / 'deploy/server'
ETC = Path('/etc/fyqst')
HOST = sys.argv[1] if len(sys.argv) > 1 else ''
if os.geteuid() != 0 or not re.fullmatch(r'[A-Za-z0-9.-]+', HOST):
    raise SystemExit('Run as root: configure.py <public hostname or IP>')
ETC.mkdir(mode=0o750, exist_ok=True)
shutil.chown(ETC, group='fyqst')
credentials_file = ETC / 'credentials.json'
first_install = not credentials_file.exists()
if first_install:
    credentials = {
        'db_password': secrets.token_hex(24),
        'admin_key': secrets.token_hex(32),
        'sdk_key': secrets.token_hex(32),
        'admin_username': 'ops',
        'admin_password': secrets.token_urlsafe(20),
    }
    credentials_file.write_text(json.dumps(credentials, ensure_ascii=False, indent=2) + '\n')
    credentials_file.chmod(0o600)
else:
    credentials = json.loads(credentials_file.read_text())
first_install = not credentials.get('bootstrap_complete', False)

environment = {
    'FYQST_ROOT': str(ROOT),
    'FYQST_DB_PASSWORD': credentials['db_password'],
    'FYQST_ADMIN_KEY': credentials['admin_key'],
    'FYQST_SDK_KEY': credentials['sdk_key'],
    'TZ': 'Asia/Shanghai',
    'ADMIN_HOST': '127.0.0.1',
    'ADMIN_PORT': '8090',
    'ADMIN_DB_URL': f"mysql://fyqst:{credentials['db_password']}@127.0.0.1:3306/ttf_ly_osadmin",
    'ADMIN_GAME_KEY': credentials['admin_key'],
    'ADMIN_ORIGINS': f'http://{HOST},http://127.0.0.1,http://127.0.0.1:8090',
    'ADMIN_GAME_ORIGINS': 'http://127.0.0.1:20001',
    'ADMIN_SECURE_COOKIE': 'false',
}
envfile = ETC / 'environment'
envfile.write_text(''.join(f'{key}={value}\n' for key, value in environment.items()))
envfile.chmod(0o640)
shutil.chown(envfile, group='fyqst')

# SQL values below are generated hexadecimal secrets; there is no user-supplied SQL.
password = credentials['db_password']
statements = []
for host in ['127.0.0.1', 'localhost']:
    statements.append(f"ALTER USER 'fyqst'@'{host}' IDENTIFIED BY '{password}';")
statements.append(
    "UPDATE ttf_ly_login.uw_server_info SET "
    f"dbLink='server=127.0.0.1;database=ttf_ly_game1;uid=fyqst;pwd={password};charset=utf8;port=3306' WHERE id=1;"
)
subprocess.run(['mariadb'], input='\n'.join(statements), text=True, check=True)

# The served asset copy is generated. No tracked source/config files are edited.
public = ROOT / '.local/public'
if public.exists():
    shutil.rmtree(public)
shutil.copytree(ROOT / 'www/wwwroot/www', public,
                ignore=shutil.ignore_patterns('*.mp3', '*.ogg', '*.wav', '*.m4a', '*.gz', '*.br'))
shutil.copyfile(DEPLOY / 'gateway.js', public / 'js/server-gateway.js')
htmlfile = public / 'game.html'
html = htmlfile.read_text()
html = html.replace('<head>', '<head>\n<script src="/js/server-gateway.js?v=1"></script>', 1)
html = html.replace('http://127.0.0.1:9902/', '/_version/')
htmlfile.write_text(html)
sdk_css = public / 'css/sdk.css'
sdk_css.write_text(sdk_css.read_text().replace('/ttf/css/', '/css/'))

for name in ['game2.min.js', 'all.min.js']:
    file = public / 'libs/modules' / name
    code = file.read_text()
    old = 'var r = "//" + e + ":" + i + this._getHttpParams(t);'
    if name == 'all.min.js':
        old = 'var r="//"+e+":"+i+this._getHttpParams(t);'
    new = 'var r = window.FyqstGateway.http(i, this._getHttpParams(t));'
    if code.count(old) != 1:
        raise SystemExit(f'Unexpected HTTP client in {file}; source changed, stopped.')
    code = code.replace(old, new)
    old = 'this.socket = io(t, e)'
    if name == 'all.min.js':
        old = 'this.socket=io(t,e)'
    if code.count(old) != 1:
        raise SystemExit(f'Unexpected Socket.IO client in {file}; source changed, stopped.')
    code = code.replace(old, 'this.socket = io(window.FyqstGateway.socket(t, e), e)')
    file.write_text(code)

# Precompress only text formats. Images and audio never consume compression CPU.
for file in public.rglob('*'):
    if file.is_file() and file.suffix.lower() in {'.js', '.json', '.css', '.html', '.svg', '.fnt'}:
        if file.stat().st_size >= 512:
            data = file.read_bytes()
            compressed = gzip.compress(data, compresslevel=9, mtime=0)
            if len(compressed) < len(data):
                Path(str(file) + '.gz').write_bytes(compressed)
for directory in [ROOT / '.local', public]:
    directory.chmod(0o755)

pool = f'''[fyqst]
user = fyqst
group = fyqst
listen = /run/php/fyqst.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = ondemand
pm.max_children = 2
pm.process_idle_timeout = 10s
pm.max_requests = 200
clear_env = yes
env[FYQST_DB_PASSWORD] = {credentials['db_password']}
env[FYQST_SDK_KEY] = {credentials['sdk_key']}
php_admin_value[date.timezone] = Asia/Shanghai
php_admin_flag[display_errors] = off
php_admin_flag[log_errors] = on
php_admin_value[error_log] = /srv/fyqst/.local/php-error.log
php_admin_value[session.save_path] = /var/lib/fyqst/sessions
'''
php_pool = Path('/etc/php/8.3/fpm/pool.d/fyqst.conf')
php_pool.write_text(pool)
php_pool.chmod(0o640)

services = {
    'log': ('Server/s1', 'logApp.js'),
    'login': ('Server/uc', 'mainApp.js'),
    'version': ('Server/uc', 'versionApp.js'),
    'callback': ('Server/uc', 'viewApp.js'),
    'game': ('Server/s1', 'serverApp.js'),
    'city': ('Server/s1/wserver', 'cityserver.js'),
    'battle': ('Server/s1/battleserver', 'battleserver.js'),
    'admin': ('admin/api', 'src/server.ts'),
}
ports = {'log': 7000, 'login': 9901, 'version': 9902, 'callback': 9903,
         'game': 20001, 'city': 10001, 'battle': 9001, 'admin': 8090}
previous = None
for name, (directory, entry) in services.items():
    unit = f'''[Unit]
Description=FYQST {name}
After=network.target mariadb.service
{f'After=fyqst-{previous}.service' if previous else ''}
Requires=mariadb.service
PartOf=fyqst.target

[Service]
Type=simple
User=fyqst
Group=fyqst
WorkingDirectory={ROOT / directory}
EnvironmentFile=/etc/fyqst/environment
ExecStart=/usr/local/lib/fyqst/bun --smol --preload {DEPLOY / 'preload.cjs'} {ROOT / directory / entry}
ExecStartPost=/usr/bin/python3 {DEPLOY / 'wait-port.py'} {ports[name]}
TimeoutStartSec=100
Restart=on-failure
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=50
UMask=0027
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
SyslogIdentifier=fyqst-{name}

[Install]
WantedBy=fyqst.target
'''
    Path(f'/etc/systemd/system/fyqst-{name}.service').write_text(unit)
    previous = name
units = ' '.join(f'fyqst-{name}.service' for name in services)
Path('/etc/systemd/system/fyqst.target').write_text(f'''[Unit]
Description=FYQST game and operations services
Wants={units}
After=network.target mariadb.service

[Install]
WantedBy=multi-user.target
''')

nginx = (DEPLOY / 'nginx.conf').read_text().replace('__PUBLIC_HOST__', HOST)
Path('/etc/nginx/sites-available/fyqst').write_text(nginx)
link = Path('/etc/nginx/sites-enabled/fyqst')
if not link.exists():
    link.symlink_to('/etc/nginx/sites-available/fyqst')
default = Path('/etc/nginx/sites-enabled/default')
if default.is_symlink() and str(default.resolve()) == '/etc/nginx/sites-available/default':
    default.unlink()

subprocess.run(['chown', '-R', 'fyqst:fyqst', str(ROOT / '.local'),
                str(ROOT / 'Server/s1/logs'), str(ROOT / 'Server/uc/logs')], check=True)
runtime_env = os.environ | environment
admin_exists = subprocess.check_output(
    ['mariadb', '-Nse', "SELECT COUNT(*) FROM ttf_ly_osadmin.osa_user WHERE user_name='ops'"], text=True
).strip() != '0'
if not admin_exists:
    subprocess.run(['/usr/local/lib/fyqst/bun', 'src/user-cli.ts', 'ops'],
        cwd=ROOT / 'admin/api', env=runtime_env | {'ADMIN_PASSWORD': credentials['admin_password']}, check=True)
if first_install:
    subprocess.run(['mariadb', '-e',
        "UPDATE ttf_ly_osadmin.osa_user SET status=0 WHERE user_name='admin'"], check=True)
credentials['bootstrap_complete'] = True
credentials_file.write_text(json.dumps(credentials, ensure_ascii=False, indent=2) + '\n')
print(f'Runtime prepared for http://{HOST}/; credentials saved in {credentials_file}')
