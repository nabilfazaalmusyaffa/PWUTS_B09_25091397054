"""Startup must register Ajax page handlers before the router renders a deep link."""
import unittest
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / 'index.html'
REGISTRATION = INDEX.parent / 'pages/registrasi.html'
APP_JS = INDEX.parent / 'assets/js/app.js'
EXPLORE_JS = INDEX.parent / 'assets/js/eksplorasi.js'
REFINED_CSS = INDEX.parent / 'assets/css/refined.css'


class AssetLoadTests(unittest.TestCase):
    def test_campus_name_and_type_typography_is_less_heavy(self):
        css = REFINED_CSS.read_text(encoding='utf-8')
        self.assertRegex(css, r'\.filters label\s*\{[^}]*font-weight:600;')
        self.assertRegex(css, r'\.campus-name\s*\{[^}]*font-weight:600;')
        self.assertRegex(css, r'\.campus-tag\s*\{[^}]*font-weight:600;')

    def test_reveal_can_repeat_after_scrolling_away_and_back(self):
        app = APP_JS.read_text(encoding='utf-8')
        self.assertIn("entry.target.classList.toggle('is-visible', entry.isIntersecting)", app)
        self.assertNotIn('observer.unobserve(entry.target)', app)

    def test_reveal_starts_near_viewport_edge(self):
        app = APP_JS.read_text(encoding='utf-8')
        self.assertIn("threshold: 0.01, rootMargin: '0px 0px -2% 0px'", app)

    def test_focused_form_controls_stay_visible_but_heading_can_reanimate(self):
        app = APP_JS.read_text(encoding='utf-8')
        self.assertIn("document.activeElement.matches('input,select,textarea,button,a')", app)
        self.assertNotIn('if (!motionEnabled || entry.target.contains(document.activeElement))', app)

    def test_signup_links_return_to_registration_heading_even_on_same_route(self):
        registration = REGISTRATION.read_text(encoding='utf-8')
        app = APP_JS.read_text(encoding='utf-8')
        self.assertIn('id="kenalan-title"', registration)
        self.assertIn('tabindex="-1"', registration)
        self.assertIn("a[data-view=\"registrasi\"]", app)
        self.assertIn('scrollToRegistration()', app)
        self.assertIn("heading.scrollIntoView({ behavior: 'instant'", app)

    def test_scroll_reveal_includes_ajax_content_and_respects_reduced_motion(self):
        app = APP_JS.read_text(encoding='utf-8')
        explore = EXPLORE_JS.read_text(encoding='utf-8')
        css = REFINED_CSS.read_text(encoding='utf-8')
        self.assertIn('prefers-reduced-motion: reduce', app)
        self.assertIn('!document.hidden', app)
        self.assertIn("visibilitychange", app)
        self.assertIn('IntersectionObserver', app)
        self.assertIn('.registration-panel .field', app)
        self.assertIn('reveal(outlet)', app)
        self.assertIn('window.SmartFinder.reveal(results)', explore)
        self.assertIn('window.SmartFinder.forget(results)', explore)
        self.assertIn('motion-enabled', css)
        self.assertIn('--float-offset', css)

    def test_registration_uses_guided_selection_instead_of_technical_note(self):
        html = REGISTRATION.read_text(encoding='utf-8')
        self.assertNotIn('Validasi dilakukan sebelum HTTP POST.', html)
        self.assertIn('id="academic-progress"', html)
        self.assertIn('role="progressbar"', html)
        self.assertIn('id="academic-progress-text"', html)

    def test_hero_card_and_footer_use_inclusive_copy(self):
        html = INDEX.read_text(encoding='utf-8')
        self.assertIn('01 TEMUKAN', html)
        self.assertIn('02 KENALI', html)
        self.assertIn('03 TERHUBUNG', html)
        self.assertNotIn('01 / TEMUKAN', html)
        self.assertNotIn('Universitas<br>Negeri Surabaya', html)
        self.assertIn('Kampus,<br>fakultas &amp; prodi', html)
        self.assertIn('<span>@smartfinder.2026</span>', html)

    def test_fragment_handlers_load_before_router(self):
        html = INDEX.read_text(encoding='utf-8')
        self.assertLess(html.index('assets/js/eksplorasi.js'), html.index('assets/js/app.js'))
        self.assertLess(html.index('assets/js/registrasi.js'), html.index('assets/js/app.js'))


if __name__ == '__main__':
    unittest.main()
