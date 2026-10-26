"""Server demo UTS: HTTP statis + POST registrasi tanpa penyimpanan data."""
import json
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, message):
        body = json.dumps({'message': message}, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/registrasi':
            return self.send_json(404, 'Endpoint tidak ditemukan.')
        if self.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
            return self.send_json(415, 'Kirim data sebagai JSON.')
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 4096:
                return self.send_json(413, 'Ukuran formulir tidak valid.')
            payload = json.loads(self.rfile.read(size))
            if not isinstance(payload, dict):
                raise ValueError('payload bukan objek')
        except (ValueError, json.JSONDecodeError):
            return self.send_json(400, 'Format JSON tidak valid.')
        try:
            # Data tidak dibekukan saat server mulai: revisi kampus langsung berlaku.
            data = json.loads((ROOT / 'data/universitas.json').read_text(encoding='utf-8'))
        except (OSError, ValueError):
            return self.send_json(503, 'Data akademik belum tersedia. Coba lagi nanti.')
        values = {key: payload.get(key) for key in ('name', 'email', 'password', 'city_id', 'university_id', 'faculty_id', 'study_program_id')}
        if any(not isinstance(value, str) for value in values.values()):
            return self.send_json(422, 'Semua kolom wajib diisi.')
        name, email, password = (values[key].strip() for key in ('name', 'email', 'password'))
        if not name or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or len(password) < 8:
            return self.send_json(422, 'Nama, email, atau kata sandi tidak valid.')
        if values['city_id'] not in {item['id'] for item in data['cities']}:
            return self.send_json(422, 'Kota domisili tidak tersedia.')
        if values['university_id'] not in {item['id'] for item in data['universities']}:
            return self.send_json(422, 'Kampus tidak tersedia.')
        if not any(item['id'] == values['faculty_id'] and item['university_id'] == values['university_id'] for item in data['faculties']):
            return self.send_json(422, 'Fakultas tidak sesuai dengan kampus.')
        if not any(item['id'] == values['study_program_id'] and item['university_id'] == values['university_id'] and item['faculty_id'] == values['faculty_id'] for item in data['study_programs']):
            return self.send_json(422, 'Program studi tidak sesuai dengan fakultas.')
        # Tidak menyimpan ataupun mencetak payload / kata sandi; hanya validasi ulang.
        return self.send_json(200, 'Simulasi berhasil: data diterima dan divalidasi server, tetapi akun tidak dibuat dan data tidak disimpan.')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(('127.0.0.1', port), DemoHandler)
    print(f'SmartFinder demo: http://127.0.0.1:{server.server_port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
