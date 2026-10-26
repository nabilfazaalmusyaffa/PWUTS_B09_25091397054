window.initRegistrasi = async function initRegistrasi(root) {
  const panel = root.querySelector('#registration-panel');
  const data = await window.SmartFinder.data();
  if (!panel.isConnected) return;
  const form = panel.querySelector('#registration-form');
  const city = form.elements.city_id;
  const university = form.elements.university_id;
  const faculty = form.elements.faculty_id;
  const program = form.elements.study_program_id;
  const status = panel.querySelector('#form-status');
  const submit = panel.querySelector('#submit-button');
  const progress = panel.querySelector('#academic-progress');
  const progressBar = progress.querySelector('.progress-track');
  const progressFill = progress.querySelector('.progress-fill');
  const progressText = panel.querySelector('#academic-progress-text');

  function updateProgress() {
    const step = !university.value ? 0 : !faculty.value ? 1 : !program.value ? 2 : 3;
    const messages = ['Mulai dengan memilih kampus', 'Sekarang pilih fakultas', 'Tentukan program studi', 'Pilihan akademik siap'];
    progress.dataset.step = String(step);
    progressBar.setAttribute('aria-valuenow', String(step));
    progressFill.style.width = `${step / 3 * 100}%`;
    progressText.textContent = messages[step];
  }

  data.cities.forEach(item => city.add(new Option(item.name, item.id)));
  data.universities.forEach(item => {
    const location = data.cities.find(cityItem => cityItem.id === item.city_id)?.name || '';
    university.add(new Option(`${item.name} (${location})`, item.id));
  });
  function fillPrograms() {
    program.replaceChildren(new Option(faculty.value ? 'Pilih program studi' : 'Pilih fakultas terlebih dahulu', ''));
    program.disabled = !faculty.value;
    data.study_programs.filter(item => item.university_id === university.value && item.faculty_id === faculty.value)
      .forEach(item => program.add(new Option(item.name, item.id)));
    setError('study_program_id', '');
    updateProgress();
  }
  function fillFaculties() {
    faculty.replaceChildren(new Option(university.value ? 'Pilih fakultas' : 'Pilih kampus terlebih dahulu', ''));
    faculty.disabled = !university.value;
    data.faculties.filter(item => item.university_id === university.value)
      .forEach(item => faculty.add(new Option(item.name, item.id)));
    setError('faculty_id', '');
    fillPrograms();
  }
  university.addEventListener('change', fillFaculties);
  faculty.addEventListener('change', fillPrograms);
  program.addEventListener('change', updateProgress);
  updateProgress();
  const names = ['name', 'email', 'password', 'confirm_password', 'city_id', 'university_id', 'faculty_id', 'study_program_id'];
  function setError(name, message) {
    const input = form.elements[name];
    panel.querySelector(`#${name}-error`).textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  function validate() {
    const values = Object.fromEntries(names.map(name => [name, form.elements[name].value.trim()]));
    const errors = {
      name: values.name ? '' : 'Nama lengkap wajib diisi.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? '' : 'Masukkan alamat email yang valid.',
      password: values.password.length >= 8 ? '' : 'Kata sandi minimal 8 karakter.',
      confirm_password: values.confirm_password && values.confirm_password === values.password ? '' : 'Konfirmasi harus sama dengan kata sandi.',
      city_id: data.cities.some(item => item.id === values.city_id) ? '' : 'Pilih kota domisili.',
      university_id: data.universities.some(item => item.id === values.university_id) ? '' : 'Pilih kampus.',
      faculty_id: data.faculties.some(item => item.id === values.faculty_id && item.university_id === values.university_id) ? '' : 'Pilih fakultas sesuai kampus.',
      study_program_id: data.study_programs.some(item => item.id === values.study_program_id && item.university_id === values.university_id && item.faculty_id === values.faculty_id) ? '' : 'Pilih prodi sesuai fakultas.'
    };
    names.forEach(name => setError(name, errors[name]));
    const firstInvalid = names.find(name => errors[name]);
    if (firstInvalid) form.elements[firstInvalid].focus();
    return !firstInvalid;
  }
  names.forEach(name => {
    const input = form.elements[name];
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(name, '');
      status.textContent = '';
    });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    if (!validate()) { status.textContent = 'Periksa kembali kolom yang ditandai.'; return; }
    const payload = Object.fromEntries(names.filter(name => name !== 'confirm_password').map(name => [name, form.elements[name].value.trim()]));
    submit.disabled = true;
    status.textContent = 'Mengirim simulasi registrasi…';
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null);
      if (!result) {
        const endpoint = new URL(form.action, document.baseURI);
        throw new Error(`API di ${endpoint.origin} tidak mengembalikan JSON (HTTP ${response.status}). Buka halaman melalui alamat yang ditampilkan oleh python3 server.py, termasuk portnya; jangan gunakan Live Server atau server statis.`);
      }
      if (!response.ok) {
        const stale = response.status === 422 && /tidak tersedia|tidak sesuai/.test(result.message);
        throw new Error(stale ? `${result.message} Muat ulang halaman untuk memperbarui pilihan.` : result.message || `HTTP ${response.status}`);
      }
      if (!panel.isConnected) return;
      status.className = 'form-status success';
      status.textContent = result.message;
      form.reset();
      fillFaculties();
      names.forEach(name => setError(name, ''));
    } catch (error) {
      if (!panel.isConnected) return;
      status.className = 'form-status failure';
      status.textContent = `Gagal mengirim: ${error instanceof TypeError ? 'Koneksi ke server gagal. Buka halaman melalui alamat yang ditampilkan oleh python3 server.py, termasuk portnya.' : error.message}`;
    } finally {
      if (panel.isConnected) submit.disabled = false;
    }
  });
};
