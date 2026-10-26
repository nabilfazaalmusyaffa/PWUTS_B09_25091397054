"""Regresi: server demo harus membaca data terbaru saat data JSON diperbarui."""
import json
import subprocess
import sys
import tempfile
import unittest
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DemoServerTests(unittest.TestCase):
    def test_program_outside_selected_faculty_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            (folder / 'data').mkdir()
            (folder / 'server.py').write_bytes((ROOT / 'server.py').read_bytes())
            (folder / 'data' / 'universitas.json').write_text(json.dumps({
                'cities': [{'id': 'city-1'}],
                'universities': [{'id': 'university-1'}],
                'faculties': [{'id': 'faculty-a', 'university_id': 'university-1'},
                              {'id': 'faculty-b', 'university_id': 'university-1'}],
                'study_programs': [{'id': 'program-1', 'university_id': 'university-1', 'faculty_id': 'faculty-a'}]
            }), encoding='utf-8')
            process = subprocess.Popen(
                [sys.executable, 'server.py', '0'], cwd=folder,
                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True
            )
            try:
                port = int(process.stdout.readline().strip().rsplit(':', 1)[1])
                request = urllib.request.Request(
                    f'http://127.0.0.1:{port}/api/registrasi',
                    data=json.dumps({
                        'name': 'Tester', 'email': 'tester@example.test', 'password': 'password123',
                        'city_id': 'city-1', 'university_id': 'university-1',
                        'faculty_id': 'faculty-b', 'study_program_id': 'program-1'
                    }).encode(), headers={'Content-Type': 'application/json'}, method='POST'
                )
                with self.assertRaises(urllib.error.HTTPError) as failure:
                    urllib.request.urlopen(request, timeout=3)
                self.assertEqual(failure.exception.code, 422)
            finally:
                process.terminate()
                process.wait(timeout=3)
                process.stdout.close()

    def test_updated_campus_is_accepted_without_server_restart(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            (folder / 'data').mkdir()
            (folder / 'server.py').write_bytes((ROOT / 'server.py').read_bytes())
            data_path = folder / 'data' / 'universitas.json'
            data_path.write_text(json.dumps({
                'cities': [{'id': 'city-1'}],
                'universities': [{'id': 'old-university'}],
                'faculties': [{'id': 'old-faculty', 'university_id': 'old-university'}],
                'study_programs': [{'id': 'old-program', 'university_id': 'old-university', 'faculty_id': 'old-faculty'}]
            }), encoding='utf-8')
            process = subprocess.Popen(
                [sys.executable, 'server.py', '0'], cwd=folder,
                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True
            )
            try:
                line = process.stdout.readline()
                self.assertIn('http://127.0.0.1:', line)
                port = int(line.strip().rsplit(':', 1)[1])
                data_path.write_text(json.dumps({
                    'cities': [{'id': 'city-1'}],
                    'universities': [{'id': 'new-university'}],
                    'faculties': [{'id': 'new-faculty', 'university_id': 'new-university'}],
                    'study_programs': [{'id': 'new-program', 'university_id': 'new-university', 'faculty_id': 'new-faculty'}]
                }), encoding='utf-8')
                payload = {
                    'name': 'Tester', 'email': 'tester@example.test',
                    'password': 'password123', 'city_id': 'city-1',
                    'university_id': 'new-university', 'faculty_id': 'new-faculty',
                    'study_program_id': 'new-program'
                }
                request = urllib.request.Request(
                    f'http://127.0.0.1:{port}/api/registrasi',
                    data=json.dumps(payload).encode(),
                    headers={'Content-Type': 'application/json'}, method='POST'
                )
                with urllib.request.urlopen(request, timeout=3) as response:
                    self.assertEqual(response.status, 200)
                    self.assertIn('tidak disimpan', json.load(response)['message'])
            finally:
                process.terminate()
                process.wait(timeout=3)
                process.stdout.close()


if __name__ == '__main__':
    unittest.main()
