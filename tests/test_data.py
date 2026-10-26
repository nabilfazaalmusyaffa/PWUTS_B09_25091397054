"""Jaga relasi provinsi → kota → kampus → fakultas → prodi."""
import json
import unittest
from collections import Counter
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parents[1] / 'data/universitas.json'


class AcademicDataTests(unittest.TestCase):
    def test_ubaya_and_umm_catalogs_cover_their_official_faculties(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        for campus_id, expected in {'univ-ubaya': (8, 16), 'univ-umm': (11, 38)}.items():
            with self.subTest(campus=campus_id):
                faculties = [f for f in data['faculties'] if f['university_id'] == campus_id]
                programs = [p for p in data['study_programs'] if p['university_id'] == campus_id]
                self.assertEqual((len(faculties), len(programs)), expected)
                self.assertTrue(all(f.get('source_url', '').startswith('https://') for f in faculties))

    def test_dinamika_and_umsida_faculty_catalogs_are_expanded(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        for campus_id, expected in {'univ-dinamika': (3, 8), 'univ-umsida': (5, 30)}.items():
            with self.subTest(campus=campus_id):
                faculties = [f for f in data['faculties'] if f['university_id'] == campus_id]
                programs = [p for p in data['study_programs'] if p['university_id'] == campus_id]
                self.assertEqual((len(faculties), len(programs)), expected)
                self.assertTrue(all(f.get('source_url', '').startswith('https://') for f in faculties))

    def test_brawijaya_and_jember_have_broad_sourced_faculty_catalogs(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        for campus_id, expected in {'univ-ub': (17, 81), 'univ-unej': (15, 68)}.items():
            with self.subTest(campus=campus_id):
                faculties = [f for f in data['faculties'] if f['university_id'] == campus_id]
                programs = [p for p in data['study_programs'] if p['university_id'] == campus_id]
                self.assertEqual((len(faculties), len(programs)), expected)
                self.assertTrue(all(f.get('source_url', '').startswith('https://') for f in faculties))

    def test_east_java_state_islamic_universities_have_sourced_undergraduate_catalogs(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        expected = {
            'univ-uin-sunan-ampel-surabaya': (10, 49),
            'univ-uin-maulana-malik-ibrahim-malang': (9, 34),
            'univ-uin-khas-jember': (5, 30),
            'univ-uin-satu-tulungagung': (4, 38),
            'univ-uin-madura': (5, 23),
            'univ-uin-syekh-wasil-kediri': (4, 25),
            'univ-uin-kiai-ageng-muhammad-besari-ponorogo': (4, 22),
        }
        campuses = {u['id']: u for u in data['universities']}
        for campus_id, (faculty_count, program_count) in expected.items():
            with self.subTest(campus=campus_id):
                self.assertIn(campus_id, campuses)
                self.assertEqual(campuses[campus_id]['type'], 'PTN')
                faculties = [f for f in data['faculties'] if f['university_id'] == campus_id]
                programs = [p for p in data['study_programs'] if p['university_id'] == campus_id]
                self.assertEqual(len(faculties), faculty_count)
                self.assertEqual(len(programs), program_count)
                self.assertTrue(all(f.get('source_url', '').startswith('https://') for f in faculties))

    def test_unesa_undergraduate_catalog_matches_verified_faculty_groups(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        faculties = [f for f in data['faculties'] if f['university_id'] == 'univ-unesa']
        programs = [p for p in data['study_programs'] if p['university_id'] == 'univ-unesa']
        self.assertEqual(len(faculties), 12)
        self.assertEqual(len(programs), 105)
        self.assertTrue(any(f['name'] == 'Fakultas Vokasi' for f in faculties))
        self.assertTrue(any(p['name'] == 'Manajemen Informatika (D4)' for p in programs))

    def test_its_undergraduate_catalog_matches_verified_faculty_groups(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        faculties = [f for f in data['faculties'] if f['university_id'] == 'univ-its']
        programs = [p for p in data['study_programs'] if p['university_id'] == 'univ-its']
        self.assertEqual(len(faculties), 8)
        self.assertEqual(len(programs), 55)
        self.assertTrue(any(p['name'] == 'Sistem Informasi (S1)' for p in programs))

    def test_upn_undergraduate_catalog_matches_official_list(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        faculties = [f for f in data['faculties'] if f['university_id'] == 'univ-upn']
        programs = [p for p in data['study_programs'] if p['university_id'] == 'univ-upn']
        self.assertEqual(len(faculties), 8)
        self.assertEqual(len(programs), 29)

    def test_every_program_belongs_to_a_faculty_of_its_university(self):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        campuses = {item['id']: item for item in data['universities']}
        faculties = {item['id']: item for item in data['faculties']}
        cities = {item['id']: item for item in data['cities']}
        self.assertEqual(len(campuses), len(data['universities']))
        self.assertEqual(len(faculties), len(data['faculties']))
        self.assertEqual(len({p['id'] for p in data['study_programs']}), len(data['study_programs']))
        self.assertTrue(all(u['city_id'] in cities for u in campuses.values()))
        self.assertTrue(all(f['university_id'] in campuses for f in faculties.values()))
        for program in data['study_programs']:
            self.assertIn(program['faculty_id'], faculties)
            self.assertEqual(program['university_id'], faculties[program['faculty_id']]['university_id'])
        faculty_counts = Counter(f['university_id'] for f in faculties.values())
        program_counts = Counter(p['faculty_id'] for p in data['study_programs'])
        self.assertTrue(all(faculty_counts[u] >= 1 for u in campuses))
        self.assertTrue(all(program_counts[f] >= 1 for f in faculties))


if __name__ == '__main__':
    unittest.main()
