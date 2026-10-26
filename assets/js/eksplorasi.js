window.initEksplorasi = async function initEksplorasi(root) {
  const panel = root.querySelector('#explore-panel');
  const data = await window.SmartFinder.data();
  if (!panel.isConnected) return;
  const search = panel.querySelector('#campus-search');
  const city = panel.querySelector('#campus-city');
  const type = panel.querySelector('#campus-type');
  const results = panel.querySelector('#campus-results');
  const count = panel.querySelector('#results-count');
  const empty = panel.querySelector('#campus-empty');
  const detail = panel.querySelector('#campus-detail');
  const clear = panel.querySelector('#clear-filters');
  const cities = new Map(data.cities.map(item => [item.id, item.name]));
  data.cities.forEach(item => city.add(new Option(item.name, item.id)));
  let selectedId = null;

  function placeholder() {
    detail.replaceChildren();
    const label = document.createElement('span');
    label.className = 'detail-intro';
    label.textContent = 'PILIH SATU KAMPUS';
    const message = document.createElement('p');
    message.textContent = 'Ketuk salah satu nama kampus untuk melihat fakultas, program studi, dan tautan informasi resminya.';
    detail.append(label, message);
    detail.classList.remove('is-selected');
  }
  function showDetail(university) {
    selectedId = university.id;
    detail.replaceChildren();
    detail.classList.add('is-selected');
    const label = document.createElement('span');
    label.className = 'detail-intro';
    label.textContent = 'PROFIL KAMPUS / JAWA TIMUR';
    const monogram = document.createElement('span');
    monogram.className = 'detail-monogram';
    monogram.textContent = university.short_name;
    const heading = document.createElement('h3');
    heading.textContent = university.name;
    const place = document.createElement('p');
    place.className = 'detail-place';
    place.textContent = `${university.type === 'PTN' ? 'Negeri' : 'Swasta'} · ${cities.get(university.city_id)}`;
    const description = document.createElement('p');
    description.textContent = university.description;
    const notice = document.createElement('p');
    notice.className = 'catalog-notice';
    notice.textContent = `Cakupan katalog: ${university.catalog_scope || 'S1/D4'}. Periksa kembali penerimaan dan perubahan prodi pada situs resmi kampus.`;
    const notes = document.createElement('details');
    notes.className = 'catalog-notes';
    const notesTitle = document.createElement('summary');
    notesTitle.textContent = 'Catatan verifikasi data';
    const notesList = document.createElement('ul');
    (university.catalog_notes || []).forEach(text => {
      const note = document.createElement('li');
      note.textContent = text;
      notesList.append(note);
    });
    notes.append(notesTitle, notesList);
    const subheading = document.createElement('h4');
    subheading.textContent = 'Fakultas & program studi pilihan';
    const facultyGroups = document.createElement('div');
    facultyGroups.className = 'detail-faculties';
    data.faculties.filter(faculty => faculty.university_id === university.id).forEach((faculty, index) => {
      const group = document.createElement('details');
      group.open = index === 0;
      const facultyName = document.createElement('summary');
      const programs = data.study_programs.filter(program => program.faculty_id === faculty.id);
      facultyName.textContent = `${faculty.name} (${programs.length})`;
      const list = document.createElement('ul');
      programs.forEach(program => {
        const item = document.createElement('li');
        item.textContent = program.name;
        list.append(item);
      });
      group.append(facultyName, list);
      if (faculty.source_url) {
        const facultySource = document.createElement('a');
        facultySource.href = faculty.source_url;
        facultySource.target = '_blank';
        facultySource.rel = 'noopener noreferrer';
        facultySource.className = 'source-link faculty-source';
        facultySource.textContent = 'Cek katalog resmi ↗';
        group.append(facultySource);
      }
      facultyGroups.append(group);
    });
    const source = document.createElement('a');
    source.className = 'source-link';
    source.href = university.source_url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = 'Lihat situs kampus ↗';
    detail.append(label, monogram, heading, place, description, notice);
    if (notesList.childElementCount) detail.append(notes);
    detail.append(subheading, facultyGroups, source);
    results.querySelectorAll('.campus-card').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.id === selectedId)));
    detail.focus({ preventScroll: window.innerWidth > 820 });
  }
  function update() {
    const query = search.value.trim().toLocaleLowerCase('id');
    const filtered = data.universities.filter(university => {
      const programs = data.study_programs.filter(item => item.university_id === university.id);
      const faculties = data.faculties.filter(item => item.university_id === university.id);
      const searchable = `${university.name} ${university.short_name} ${cities.get(university.city_id)} ${faculties.map(item => item.name).join(' ')} ${programs.map(item => item.name).join(' ')}`.toLocaleLowerCase('id');
      return (!query || searchable.includes(query)) && (!city.value || university.city_id === city.value) && (!type.value || university.type === type.value);
    });
    window.SmartFinder.forget(results);
    results.replaceChildren();
    count.textContent = `${filtered.length} kampus ditemukan dari ${data.universities.length} pilihan`;
    empty.hidden = filtered.length !== 0;
    clear.hidden = !query && !city.value && !type.value;
    if (!filtered.some(item => item.id === selectedId)) { selectedId = null; placeholder(); }
    filtered.forEach((university, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'campus-card';
      card.dataset.id = university.id;
      card.setAttribute('aria-pressed', String(university.id === selectedId));
      card.style.setProperty('--card-index', Math.min(index, 6));
      const top = document.createElement('span');
      top.className = 'campus-top';
      const monogram = document.createElement('span');
      monogram.className = 'campus-monogram';
      monogram.textContent = university.short_name;
      const tag = document.createElement('span');
      tag.className = 'campus-tag';
      tag.textContent = university.type === 'PTN' ? 'NEGERI' : 'SWASTA';
      top.append(monogram, tag);
      const heading = document.createElement('span');
      heading.className = 'campus-name';
      heading.textContent = university.name;
      const place = document.createElement('span');
      place.className = 'campus-place';
      place.textContent = `${cities.get(university.city_id)} · ${data.study_programs.filter(p => p.university_id === university.id).length} prodi pilihan`;
      const action = document.createElement('span');
      action.className = 'campus-action';
      action.textContent = 'Lihat profil ↗';
      card.addEventListener('click', () => showDetail(university));
      card.append(top, heading, place, action);
      results.append(card);
    });
    window.SmartFinder.reveal(results);
  }
  search.addEventListener('input', update);
  city.addEventListener('change', update);
  type.addEventListener('change', update);
  clear.addEventListener('click', () => {
    search.value = '';
    city.value = '';
    type.value = '';
    update();
    search.focus();
  });
  update();
};
