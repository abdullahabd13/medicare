// Mock Database
const MOCK_DATA = {
    doctors: [
        { id: 1, docId: 'DOC001', name: 'Dr. Alice Smith', education: 'MD, Cardiology', skills: 'Heart Surgery, ECG', room: '101A', schedule: 'Mon-Thu 9AM-4PM', specialty: 'Cardiologist' },
        { id: 2, docId: 'DOC002', name: 'Dr. Bob Jones', education: 'MBBS, Pediatrics', skills: 'Child Care, Vaccinations', room: '205B', schedule: 'Tue-Sat 10AM-6PM', specialty: 'Pediatrician' },
        { id: 3, docId: 'DOC003', name: 'Dr. Carol White', education: 'MD, Neurology', skills: 'Brain Disorders, Spinal Health', room: '302C', schedule: 'Mon, Wed, Fri 8AM-2PM', specialty: 'Neurologist' },
        { id: 4, docId: 'DOC004', name: 'Dr. David Lee', education: 'DDS, Dentistry', skills: 'Root Canal, Implants', room: '405D', schedule: 'Mon-Fri 10AM-5PM', specialty: 'Dentist' }
    ],
    appointments: [
        { id: 101, doctorId: 1, patientName: 'John Doe', date: '2023-11-20', time: '10:00 AM', status: 'Pending', symptom: 'Fever', quickBrief: 'Patient reports mild Fever starting recently.', waitTime: 0 },
        { id: 102, doctorId: 1, patientName: 'Jane Roe', date: '2023-11-21', time: '11:00 AM', status: 'Accepted', symptom: 'General Checkup', quickBrief: 'Routine checkup.', waitTime: 15 },
        { id: 103, doctorId: 2, patientName: 'Mark Smith', date: '2023-11-20', time: '02:00 PM', status: 'Pending', symptom: 'Cough', quickBrief: 'Patient reports Cough.', waitTime: 0 }
    ],
    triageQuestions: [
        { id: 1, text: 'How long have you had this symptom?', type: 'Select', options: ['Less than a day', '1-3 days', 'More than a week'], active: true },
        { id: 2, text: 'Severity (1 = Mild, 10 = Extreme)', type: 'Number', options: [], active: true },
        { id: 3, text: 'Are you taking any medications?', type: 'Text', options: [], active: true }
    ],
    notifications: []
};

// DOM Elements
const views = {
    patient: document.getElementById('patient-view'),
    doctor: document.getElementById('doctor-view'),
    manager: document.getElementById('manager-view'),
    map: document.getElementById('map-view')
};
const navBtns = {
    patient: document.getElementById('btn-patient-view'),
    doctor: document.getElementById('btn-doctor-view'),
    manager: document.getElementById('btn-manager-view'),
    map: document.getElementById('btn-map-view')
};
const doctorListEl = document.getElementById('doctor-list');
const searchInput = document.getElementById('doctor-search');
const modal = document.getElementById('booking-modal');
const closeModalBtn = document.querySelector('.close-modal');
const timeSlotsContainer = document.getElementById('time-slots');
const bookingForm = document.getElementById('booking-form');
const loginForm = document.getElementById('login-form');
const doctorDashboard = document.getElementById('doctor-dashboard');
const loginScreen = document.getElementById('login-screen');
const toastEl = document.getElementById('toast');
const appointmentListEl = document.getElementById('appointment-list');

// Triage & Notification Elements
const primarySymptomEl = document.getElementById('primary-symptom');
const triageFollowupEl = document.getElementById('triage-followup');
const notifCountEl = document.getElementById('notification-count');
const notifDropdownEl = document.getElementById('notification-dropdown');
const notifListEl = document.getElementById('notification-list');
const notifWrapper = document.querySelector('.notification-wrapper');

// Manager Elements
const managerStatsEl = document.getElementById('manager-stats');
const managerDoctorListEl = document.getElementById('manager-doctor-list');
const docCrudModal = document.getElementById('doctor-crud-modal');
const closeDocModalBtn = document.getElementById('close-doc-modal');
const docCrudForm = document.getElementById('doctor-crud-form');
const btnAddDoctor = document.getElementById('btn-add-doctor');

// Smart Operations Elements
const dynamicTriageContainer = document.getElementById('dynamic-triage-container');
const managerTriageListEl = document.getElementById('manager-triage-list');
const triageCrudModal = document.getElementById('triage-crud-modal');
const triageCrudForm = document.getElementById('triage-crud-form');
const btnAddTriage = document.getElementById('btn-add-triage');
const managerApptListEl = document.getElementById('manager-appt-list');
const mgrReqBadge = document.getElementById('mgr-req-badge');
const managerMapNodesEl = document.getElementById('manager-map-nodes');
const managerMapEdgesEl = document.getElementById('manager-map-edges');

// Map Elements
const mapRoomSearchEl = document.getElementById('room-search');
const btnFindPath = document.getElementById('btn-find-path');
const btnToggleVoice = document.getElementById('btn-toggle-voice');
const directionsListEl = document.getElementById('directions-list');
const mapPathSvg = document.getElementById('map-path-svg');
let voiceEnabled = false;

// --- Initialization ---
function init() {
    renderDoctorList(MOCK_DATA.doctors);
    setupEventListeners();
    updateNotificationUI();
    render3DMapNodes(); // Render dynamic map DB
    
    // Set min date for date picker to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').min = today;
}

// --- Navigation ---
function switchView(viewName) {
    Object.values(views).forEach(v => {
        if(v) v.classList.add('hidden');
    });
    Object.values(navBtns).forEach(b => {
        if(b) b.classList.remove('active');
    });
    
    if(views[viewName]) views[viewName].classList.remove('hidden');
    if(navBtns[viewName]) navBtns[viewName].classList.add('active');

    if (viewName === 'manager') renderManagerDashboard();
}

// --- Toast Notification ---
function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// --- Patient View Functions ---
function renderDoctorList(doctors) {
    doctorListEl.innerHTML = '';
    if (doctors.length === 0) {
        doctorListEl.innerHTML = '<p class="text-muted">No doctors found matching your search.</p>';
        return;
    }

    doctors.forEach(doc => {
        const initials = doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('');
        const card = document.createElement('div');
        card.className = 'doc-card glass';
        card.innerHTML = `
            <div class="doc-header">
                <div class="doc-avatar">${initials}</div>
                <div class="doc-info">
                    <h3>${doc.name}</h3>
                    <p>${doc.specialty}</p>
                </div>
            </div>
            <div class="doc-details">
                <p><i class="fas fa-graduation-cap"></i> ${doc.education}</p>
                <p><i class="fas fa-stethoscope"></i> ${doc.skills}</p>
                <p><i class="far fa-clock"></i> ${doc.schedule}</p>
                <p><i class="fas fa-door-open"></i> Room ${doc.room}</p>
            </div>
            <button class="btn-book" onclick="openBookingModal(${doc.id})">Book Appointment</button>
        `;
        doctorListEl.appendChild(card);
    });
}

function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = MOCK_DATA.doctors.filter(doc => 
        doc.name.toLowerCase().includes(term) || 
        doc.specialty.toLowerCase().includes(term) ||
        doc.skills.toLowerCase().includes(term)
    );
    renderDoctorList(filtered);
}

// --- Booking Modal Functions ---
const availableTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
let currentDoctorIdForBooking = null;

function renderDynamicTriage() {
    dynamicTriageContainer.innerHTML = '';
    const activeQuestions = MOCK_DATA.triageQuestions.filter(q => q.active);
    
    if (activeQuestions.length === 0) return;

    activeQuestions.forEach(q => {
        const div = document.createElement('div');
        div.className = 'form-group';
        
        let inputHtml = '';
        if (q.type === 'Select') {
            const opts = q.options.map(o => `<option value="${o}">${o}</option>`).join('');
            inputHtml = `<select class="form-control dynamic-triage-input" data-qid="${q.id}" required>
                            <option value="">Select an option...</option>
                            ${opts}
                         </select>`;
        } else if (q.type === 'Number') {
            inputHtml = `<input type="number" class="form-control dynamic-triage-input" data-qid="${q.id}" required min="1">`;
        } else {
            inputHtml = `<input type="text" class="form-control dynamic-triage-input" data-qid="${q.id}" required>`;
        }

        div.innerHTML = `<label>${q.text}</label>${inputHtml}`;
        dynamicTriageContainer.appendChild(div);
    });
}

function openBookingModal(doctorId) {
    const doc = MOCK_DATA.doctors.find(d => d.id === doctorId);
    if (!doc) return;

    currentDoctorIdForBooking = doctorId;
    document.getElementById('modal-doctor-name').textContent = `Book with ${doc.name}`;
    document.getElementById('modal-doctor-specialty').textContent = doc.specialty;
    
    // Render time slots
    timeSlotsContainer.innerHTML = '';
    availableTimeSlots.forEach(time => {
        const btn = document.createElement('div');
        btn.className = 'slot-btn';
        btn.textContent = time;
        btn.onclick = () => selectTimeSlot(btn, time);
        timeSlotsContainer.appendChild(btn);
    });

    // Reset form
    bookingForm.reset();
    document.getElementById('selected-time').value = '';
    dynamicTriageContainer.classList.add('hidden');
    
    // Render the dynamic triage questions based on DB
    renderDynamicTriage();

    modal.classList.add('show');
}

function handleTriageChange(e) {
    const val = e.target.value;
    if (val !== '') {
        dynamicTriageContainer.classList.remove('hidden');
    } else {
        dynamicTriageContainer.classList.add('hidden');
    }
}

function selectTimeSlot(btnEl, time) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    document.getElementById('selected-time').value = time;
}

function submitBooking(e) {
    e.preventDefault();
    const patientName = document.getElementById('patient-name').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('selected-time').value;
    const symptom = document.getElementById('primary-symptom').value;

    if (!time) {
        showToast('Please select a time slot.');
        return;
    }

    // Collect Dynamic Triage Responses
    let triageResponses = {};
    let briefAdditions = [];
    document.querySelectorAll('.dynamic-triage-input').forEach(input => {
        const qid = parseInt(input.dataset.qid);
        const q = MOCK_DATA.triageQuestions.find(qt => qt.id === qid);
        const val = input.value;
        if (q && val) {
            triageResponses[qid] = { question: q.text, answer: val };
            briefAdditions.push(`${q.text}: ${val}`);
        }
    });

    // Generate Quick Brief
    let quickBrief = `Reason: ${symptom || 'General Checkup'}.`;
    if (briefAdditions.length > 0) {
        quickBrief += ` Details - ${briefAdditions.join(' | ')}`;
    }

    // Save to mock DB
    const newApt = {
        id: Date.now(),
        doctorId: currentDoctorIdForBooking,
        patientName,
        date,
        time,
        status: 'Pending',
        symptom,
        quickBrief,
        waitTime: Math.floor(Math.random() * 30), // mock wait time
        triageDetails: JSON.stringify(triageResponses)
    };
    MOCK_DATA.appointments.push(newApt);

    // Trigger Notification for Doctor (Mock System)
    const doc = MOCK_DATA.doctors.find(d => d.id === currentDoctorIdForBooking);
    addNotification(`New appointment booking from ${patientName} on ${date} with ${doc.name}.`);

    modal.classList.remove('show');
    showToast('Appointment Request Sent Successfully!');
    
    // Update dashboard if the booked doctor is currently logged in
    if(loggedInDoctorId === currentDoctorIdForBooking) {
        renderDoctorDashboard();
    }
    
    if (views.manager && !views.manager.classList.contains('hidden')) renderManagerDashboard();
}

// --- Doctor Portal Functions ---
function handleLogin(e) {
    e.preventDefault();
    const docIdInput = document.getElementById('doc-id').value;
    // Simple mock logic: accept if user types a valid DOC id
    const doc = MOCK_DATA.doctors.find(d => d.docId === docIdInput.toUpperCase() || 'DOC123'); // fallback generic logic
    
    // Let's just tie login to DOC001 if DOC123 is typed
    let targetDoc = MOCK_DATA.doctors.find(d => d.docId === docIdInput.toUpperCase());
    if(!targetDoc) targetDoc = MOCK_DATA.doctors[0]; // mock behavior

    loggedInDoctorId = targetDoc.id;
    
    loginScreen.classList.add('hidden');
    doctorDashboard.classList.remove('hidden');
    
    document.getElementById('dash-doc-name').textContent = targetDoc.name;
    document.getElementById('dash-doc-room').textContent = targetDoc.room;
    document.getElementById('dash-doc-schedule').textContent = targetDoc.schedule;

    renderDoctorDashboard();
    showToast(`Welcome back, ${targetDoc.name}`);
}

function handleLogout() {
    loggedInDoctorId = null;
    doctorDashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginForm.reset();
}

function renderDoctorDashboard(filterBy = 'all') {
    if (!loggedInDoctorId) return;

    let apts = MOCK_DATA.appointments.filter(a => a.doctorId === loggedInDoctorId);
    if (filterBy !== 'all') {
        apts = apts.filter(a => a.status === filterBy);
    }

    // Sort by date (mock implementation)
    apts.sort((a, b) => new Date(a.date) - new Date(b.date));

    appointmentListEl.innerHTML = '';
    
    if (apts.length === 0) {
        appointmentListEl.innerHTML = '<p class="text-muted" style="text-align:center; padding: 1rem;">No appointments found.</p>';
        return;
    }

    apts.forEach(apt => {
        const li = document.createElement('li');
        li.className = `apt-item glass ${apt.status}`;
        
        // Smart Layer: Injecting Triage Quick Brief
        const briefHtml = `<div class="apt-brief"><i class="fas fa-clipboard-list" style="color:var(--accent-color)"></i> <strong>Brief:</strong> ${apt.quickBrief || 'No details provided.'}</div>`;
        
        let actionButtons = '';
        if (apt.status === 'Pending') {
            actionButtons = `
                <button class="action-btn accept" onclick="updateAppointmentStatus(${apt.id}, 'Accepted')"><i class="fas fa-check"></i> Accept</button>
                <button class="action-btn reschedule" onclick="updateAppointmentStatus(${apt.id}, 'ChangeRequested', true)"><i class="fas fa-exchange-alt"></i> Request Change</button>
            `;
        } else if (apt.status === 'ChangeRequested') {
            actionButtons = `<span class="text-muted" style="font-size: 0.85rem; font-weight: bold;"><i class="fas fa-hourglass-half"></i> Pending Manager Approval</span>`;
        } else {
            actionButtons = `<span class="text-muted" style="font-size: 0.85rem; font-weight: bold;">${apt.status}</span>`;
        }

        li.innerHTML = `
            <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div class="apt-info">
                        <h4>${apt.patientName}</h4>
                        <p><i class="far fa-calendar-alt"></i> ${apt.date} | <i class="far fa-clock"></i> ${apt.time}</p>
                    </div>
                    <div class="apt-actions">
                        ${actionButtons}
                    </div>
                </div>
                ${briefHtml}
            </div>
        `;
        appointmentListEl.appendChild(li);
    });
}

function updateAppointmentStatus(aptId, newStatus, isDoctorRequest = false) {
    const apt = MOCK_DATA.appointments.find(a => a.id === aptId);
    if (apt) {
        apt.status = newStatus;
        
        if (isDoctorRequest && newStatus === 'ChangeRequested') {
            showToast(`Change request sent to Manager for approval.`);
            addNotification(`Dr. ID ${apt.doctorId} requested a schedule change for ${apt.patientName}.`);
        } else {
            showToast(`Appointment marked as ${newStatus}`);
            // Add Notification for Patient (mock) if not just a request
            if (newStatus !== 'ChangeRequested') {
                const doc = MOCK_DATA.doctors.find(d => d.id === apt.doctorId);
                addNotification(`Your appointment with ${doc.name} on ${apt.date} was ${newStatus}.`);
            }
        }

        // Re-render views
        if (loggedInDoctorId) {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            renderDoctorDashboard(activeFilter);
        }
        if (views.manager && !views.manager.classList.contains('hidden')) renderManagerDashboard();
    }
}

function handleFilter(e) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderDoctorDashboard(e.target.dataset.filter);
}

// --- Manager Portal ---
function renderManagerDashboard() {
    if (!managerStatsEl) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    let totalToday = 0;
    let totalWaitTime = 0;
    let occupancyCount = 0;
    let changeReqCount = 0;

    MOCK_DATA.appointments.forEach(apt => {
        if (apt.date === todayStr || true) { // Mocking today for MVP testing
            totalToday++;
            totalWaitTime += (apt.waitTime || 0);
            if (apt.status === 'Accepted') occupancyCount++;
        }
        if (apt.status === 'ChangeRequested') changeReqCount++;
    });

    const avgWait = totalToday > 0 ? Math.round(totalWaitTime / totalToday) : 0;
    
    // Update Badge
    if(mgrReqBadge) mgrReqBadge.textContent = changeReqCount;

    managerStatsEl.innerHTML = `
        <div class="stat-card glass emerald">
            <div class="stat-val">${totalToday}</div>
            <div class="stat-label">Appointments Today</div>
        </div>
        <div class="stat-card glass amber">
            <div class="stat-val">${avgWait} <span style="font-size:1rem;">min</span></div>
            <div class="stat-label">Avg. Wait Time</div>
        </div>
        <div class="stat-card glass" style="border-left: 4px solid var(--primary-color);">
            <div class="stat-val">${occupancyCount} / ${MOCK_DATA.doctors.length}</div>
            <div class="stat-label">Rooms Occupied</div>
        </div>
    `;

    renderManagerDoctorList();
    renderManagerTriageAdmin();
    renderManagerApptList();
    renderManagerFacilityAdmin();
}

// --- Smart Operations: Manager Facility Admin ---
function renderManagerFacilityAdmin() {
    if (!managerMapNodesEl || !managerMapEdgesEl) return;
    
    // Render Nodes
    managerMapNodesEl.innerHTML = '';
    MOCK_DATA.mapNodes.filter(n => n.type === 'room' || n.id === 'Central').forEach(node => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding: 0.5rem;"><strong>${node.id}</strong></td>
            <td style="padding: 0.5rem;">
                <input type="text" class="form-control" value="${node.label}" style="padding: 0.3rem; margin:0;" onchange="updateMapNodeLabel('${node.id}', this.value)">
            </td>
        `;
        managerMapNodesEl.appendChild(tr);
    });

    // Render Edges
    managerMapEdgesEl.innerHTML = '';
    MOCK_DATA.mapEdges.forEach((edge, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        let statusColor = edge.status === 'Open' ? 'text-success' : 'text-danger';
        
        tr.innerHTML = `
            <td style="padding: 0.5rem;">${edge.source} <i class="fas fa-arrows-alt-h text-muted"></i> ${edge.target}</td>
            <td style="padding: 0.5rem;">
                <select class="form-control" style="padding: 0.3rem; margin:0; ${edge.status !== 'Open' ? 'border-color:#ef4444; color:#ef4444;' : ''}" onchange="updateMapEdgeStatus(${idx}, this.value)">
                    <option value="Open" ${edge.status === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="Maintenance" ${edge.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="Closed" ${edge.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </td>
        `;
        managerMapEdgesEl.appendChild(tr);
    });
}

function updateMapNodeLabel(nodeId, newLabel) {
    const node = MOCK_DATA.mapNodes.find(n => n.id === nodeId);
    if (node) {
        node.label = newLabel;
        showToast(`Room ${nodeId} renamed to ${newLabel}`);
        render3DMapNodes(); // Instantly update the CSS 3D map
    }
}

function updateMapEdgeStatus(edgeIdx, newStatus) {
    if (MOCK_DATA.mapEdges[edgeIdx]) {
        MOCK_DATA.mapEdges[edgeIdx].status = newStatus;
        showToast(`Corridor status updated to ${newStatus}`);
        renderManagerFacilityAdmin(); // Refresh colors
        
        // Clear active path if any
        mapPathSvg.innerHTML = '';
        directionsListEl.innerHTML = '<li class="text-muted"><i class="fas fa-info-circle"></i> Map layout updated. Please search again.</li>';
    }
}

// --- Smart Operations: Manager Triage Admin ---
function renderManagerTriageAdmin() {
    if (!managerTriageListEl) return;
    managerTriageListEl.innerHTML = '';
    
    MOCK_DATA.triageQuestions.forEach(q => {
        const li = document.createElement('li');
        li.className = `apt-item glass ${q.active ? 'Accepted' : 'Pending'}`; // Reusing CSS
        
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <strong>${q.text}</strong> <br>
                    <small class="text-muted">Type: ${q.type} ${q.type === 'Select' ? `| Options: ${q.options.join(', ')}` : ''}</small>
                </div>
                <div>
                    <button class="action-btn" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;" onclick="openTriageModal(${q.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="deleteTriageQuestion(${q.id})"><i class="fas fa-trash"></i></button>
                    <button class="action-btn" style="opacity: 0.7;" onclick="toggleTriageQuestion(${q.id})">
                        ${q.active ? '<i class="fas fa-eye-slash text-muted"></i> Hide' : '<i class="fas fa-eye"></i> Show'}
                    </button>
                </div>
            </div>
        `;
        managerTriageListEl.appendChild(li);
    });
}

function openTriageModal(qId = null) {
    const typeSelect = document.getElementById('crud-triage-type');
    const optionsGroup = document.getElementById('triage-options-group');
    
    const toggleOptions = () => {
        if(typeSelect.value === 'Select') optionsGroup.classList.remove('hidden');
        else optionsGroup.classList.add('hidden');
    };
    
    typeSelect.removeEventListener('change', toggleOptions);
    typeSelect.addEventListener('change', toggleOptions);

    if (qId) {
        const q = MOCK_DATA.triageQuestions.find(qt => qt.id === qId);
        if (!q) return;
        document.getElementById('triage-modal-title').textContent = 'Edit Triage Question';
        document.getElementById('crud-triage-id').value = q.id;
        document.getElementById('crud-triage-text').value = q.text;
        document.getElementById('crud-triage-type').value = q.type;
        document.getElementById('crud-triage-options').value = q.options ? q.options.join(', ') : '';
        toggleOptions();
    } else {
        document.getElementById('triage-modal-title').textContent = 'Add Triage Question';
        triageCrudForm.reset();
        document.getElementById('crud-triage-id').value = '';
        toggleOptions();
    }
    triageCrudModal.classList.add('show');
}

function saveTriageQuestion(e) {
    e.preventDefault();
    const id = document.getElementById('crud-triage-id').value;
    const text = document.getElementById('crud-triage-text').value;
    const type = document.getElementById('crud-triage-type').value;
    const optionsRaw = document.getElementById('crud-triage-options').value;
    
    let options = [];
    if (type === 'Select' && optionsRaw) {
        options = optionsRaw.split(',').map(s => s.trim()).filter(s => s !== '');
    }

    if (id) {
        const idx = MOCK_DATA.triageQuestions.findIndex(q => q.id == id);
        if (idx > -1) {
            MOCK_DATA.triageQuestions[idx] = { ...MOCK_DATA.triageQuestions[idx], text, type, options };
            showToast('Question updated.');
        }
    } else {
        const newId = Date.now();
        MOCK_DATA.triageQuestions.push({ id: newId, text, type, options, active: true });
        showToast('Question added.');
    }
    triageCrudModal.classList.remove('show');
    renderManagerDashboard(); // refresh
}

function deleteTriageQuestion(id) {
    if (confirm('Delete this question?')) {
        MOCK_DATA.triageQuestions = MOCK_DATA.triageQuestions.filter(q => q.id !== id);
        renderManagerDashboard();
        showToast('Question removed.');
    }
}
function toggleTriageQuestion(id) {
    const q = MOCK_DATA.triageQuestions.find(qt => qt.id === id);
    if (q) {
        q.active = !q.active;
        renderManagerDashboard();
    }
}

// --- Smart Operations: Master Appointment Override ---
let managerAptFilter = 'all';

function handleManagerAptFilter(e) {
    document.querySelectorAll('[data-mgr-filter]').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    managerAptFilter = e.target.dataset.mgrFilter;
    renderManagerApptList();
}

function renderManagerApptList() {
    if (!managerApptListEl) return;
    managerApptListEl.innerHTML = '';
    
    let apts = [...MOCK_DATA.appointments];
    if (managerAptFilter !== 'all') {
        apts = apts.filter(a => a.status === managerAptFilter);
    }
    
    apts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    if (apts.length === 0) {
        managerApptListEl.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1rem;">No appointments found.</td></tr>';
        return;
    }

    apts.forEach(apt => {
        const doc = MOCK_DATA.doctors.find(d => d.id === apt.doctorId);
        const docName = doc ? doc.name : 'Unknown Dr.';
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        let managerActions = '';
        if (apt.status === 'ChangeRequested') {
            managerActions = `
                <button class="action-btn accept" onclick="managerApproveChange(${apt.id})"><i class="fas fa-check"></i> Approve & Notify Patient</button>
            `;
            tr.style.background = 'rgba(239, 68, 68, 0.1)';
        } else {
            managerActions = `
                <button class="action-btn reschedule" onclick="managerOverrideApt(${apt.id}, 'Rescheduled')">Move</button>
                <button class="action-btn" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="managerOverrideApt(${apt.id}, 'Cancelled')">Cancel</button>
            `;
        }

        tr.innerHTML = `
            <td style="padding: 1rem;"><strong>${apt.patientName}</strong></td>
            <td style="padding: 1rem;">${docName}</td>
            <td style="padding: 1rem;">${apt.date} <br><small class="text-muted">${apt.time}</small></td>
            <td style="padding: 1rem;">
                <span style="font-size:0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.1);">${apt.status}</span>
            </td>
            <td style="padding: 1rem; text-align: right;">
                ${managerActions}
            </td>
        `;
        managerApptListEl.appendChild(tr);
    });
}

function managerApproveChange(aptId) {
    const apt = MOCK_DATA.appointments.find(a => a.id === aptId);
    if (apt) {
        apt.status = 'Rescheduled'; // Manager accepted the move
        showToast("Change Approved. Patient Notified.");
        
        // Notify patient
        const doc = MOCK_DATA.doctors.find(d => d.id === apt.doctorId);
        addNotification(`URGENT: Your appointment with ${doc.name} was forced to reschedule. Please contact support if needed.`);
        
        renderManagerDashboard(); // Refresh all
    }
}

function managerOverrideApt(aptId, act) {
    if (confirm(`Are you sure you want to Override this appointment to: ${act}?`)) {
        const apt = MOCK_DATA.appointments.find(a => a.id === aptId);
        if (apt) {
            if (act === 'Cancelled') {
                MOCK_DATA.appointments = MOCK_DATA.appointments.filter(a => a.id !== aptId);
            } else {
                apt.status = act;
            }
            showToast(`Override successful: ${act}`);
            renderManagerDashboard();
        }
    }
}

// --- Manager Doctor CRUD ---
function renderManagerDoctorList() {
    if (!managerDoctorListEl) return;
    managerDoctorListEl.innerHTML = '';
    
    // Reverse sort to show newest first for demo
    const docs = [...MOCK_DATA.doctors].reverse();

    docs.forEach(doc => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.innerHTML = `
            <td style="padding: 1rem;">
                <strong>${doc.name}</strong><br>
                <small class="text-muted">${doc.docId}</small>
            </td>
            <td style="padding: 1rem;">${doc.specialty}</td>
            <td style="padding: 1rem;"><span style="background: rgba(79, 70, 229, 0.2); padding: 0.2rem 0.5rem; border-radius: 4px;">${doc.room}</span></td>
            <td style="padding: 1rem;"><i class="far fa-clock text-muted"></i> ${doc.schedule}</td>
            <td style="padding: 1rem; text-align: right;">
                <button class="action-btn" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;" onclick="openDoctorCrudModal(${doc.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;" onclick="deleteDoctor(${doc.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        managerDoctorListEl.appendChild(tr);
    });
}

function openDoctorCrudModal(docId = null) {
    if (docId) {
        // Edit mode
        const doc = MOCK_DATA.doctors.find(d => d.id === docId);
        if (!doc) return;
        
        document.getElementById('doc-modal-title').textContent = 'Edit Doctor Profile';
        document.getElementById('crud-doc-id').value = doc.id;
        document.getElementById('crud-doc-name').value = doc.name;
        document.getElementById('crud-doc-specialty').value = doc.specialty;
        document.getElementById('crud-doc-education').value = doc.education;
        document.getElementById('crud-doc-room').value = doc.room;
        document.getElementById('crud-doc-skills').value = doc.skills;
        document.getElementById('crud-doc-schedule').value = doc.schedule;
    } else {
        // Add mode
        document.getElementById('doc-modal-title').textContent = 'Add New Doctor';
        docCrudForm.reset();
        document.getElementById('crud-doc-id').value = '';
    }
    
    docCrudModal.classList.add('show');
}

function saveDoctor(e) {
    e.preventDefault();
    const id = document.getElementById('crud-doc-id').value;
    const name = document.getElementById('crud-doc-name').value;
    const specialty = document.getElementById('crud-doc-specialty').value;
    const education = document.getElementById('crud-doc-education').value;
    const room = document.getElementById('crud-doc-room').value;
    const skills = document.getElementById('crud-doc-skills').value;
    const schedule = document.getElementById('crud-doc-schedule').value;

    if (id) {
        // Update existing
        const docIndex = MOCK_DATA.doctors.findIndex(d => d.id == id);
        if (docIndex > -1) {
            MOCK_DATA.doctors[docIndex] = { ...MOCK_DATA.doctors[docIndex], name, specialty, education, room, skills, schedule };
            showToast('Doctor updated successfully');
        }
    } else {
        // Create new
        const newId = Date.now(); // mock ID
        const docIdStr = `DOC${MOCK_DATA.doctors.length + 1}`.padStart(6, '0');
        MOCK_DATA.doctors.push({
            id: newId,
            docId: docIdStr,
            name,
            specialty,
            education,
            room,
            skills,
            schedule
        });
        showToast('Doctor added successfully');
    }

    docCrudModal.classList.remove('show');
    renderManagerDoctorList();
    
    // Update global views so patient sees the updated list
    renderDoctorList(MOCK_DATA.doctors);
}

function deleteDoctor(docId) {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
        MOCK_DATA.doctors = MOCK_DATA.doctors.filter(d => d.id !== docId);
        // Also remove their appointments
        MOCK_DATA.appointments = MOCK_DATA.appointments.filter(a => a.doctorId !== docId);
        
        renderManagerDashboard(); // Refresh stats and list
        renderDoctorList(MOCK_DATA.doctors); // Sync patient view
        showToast('Doctor removed from system');
    }
}

// --- Notification System ---
function addNotification(message) {
    MOCK_DATA.notifications.unshift({ id: Date.now(), msg: message, read: false });
    updateNotificationUI();
}

function updateNotificationUI() {
    const unreadCount = MOCK_DATA.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        notifCountEl.textContent = unreadCount;
        notifCountEl.classList.remove('hidden');
    } else {
        notifCountEl.classList.add('hidden');
    }

    notifListEl.innerHTML = '';
    if (MOCK_DATA.notifications.length === 0) {
        notifListEl.innerHTML = '<li>No recent notifications.</li>';
    } else {
        MOCK_DATA.notifications.slice(0, 5).forEach(n => {
            const li = document.createElement('li');
            li.textContent = n.msg;
            if (!n.read) li.classList.add('unread');
            notifListEl.appendChild(li);
        });
    }
}

// --- Map & Wayfinding System ---
// 1. Dynamic Graph Database
MOCK_DATA.mapNodes = [
    { id: 'Entrance', label: 'Main Entrance', x: 50, y: 90, type: 'hallway', status: 'Open' },
    { id: 'Central', label: 'Central Desk', x: 50, y: 50, type: 'hallway', status: 'Open' },
    { id: 'HallW', label: 'West Corridor', x: 20, y: 50, type: 'hallway', status: 'Open' },
    { id: 'HallE', label: 'East Corridor', x: 80, y: 50, type: 'hallway', status: 'Open' },
    { id: '101A', label: 'Cardiology', x: 20, y: 30, type: 'room', status: 'Open' },
    { id: '302C', label: 'Neurology', x: 20, y: 10, type: 'room', status: 'Open' },
    { id: '205B', label: 'Pediatrics', x: 80, y: 30, type: 'room', status: 'Open' },
    { id: '405D', label: 'Dentistry', x: 80, y: 10, type: 'room', status: 'Open' }
];

MOCK_DATA.mapEdges = [
    { source: 'Entrance', target: 'Central', distance: 40, status: 'Open' },
    { source: 'Central', target: 'HallW', distance: 30, status: 'Open' },
    { source: 'Central', target: 'HallE', distance: 30, status: 'Open' },
    { source: 'HallW', target: '101A', distance: 20, status: 'Open' },
    { source: '101A', target: '302C', distance: 20, status: 'Open' },
    { source: 'HallE', target: '205B', distance: 20, status: 'Open' },
    { source: '205B', target: '405D', distance: 20, status: 'Open' }
];

// Helper: Build Graph Adjacency List
function buildGraph() {
    const graph = {};
    MOCK_DATA.mapNodes.forEach(n => graph[n.id] = {});
    MOCK_DATA.mapEdges.forEach(e => {
        if (e.status === 'Closed' || e.status === 'Maintenance') return; // Accessibility Override
        // Bidirectional
        if (graph[e.source] && graph[e.target]) {
            graph[e.source][e.target] = e.distance;
            graph[e.target][e.source] = e.distance;
        }
    });
    return graph;
}

// 2. Dijkstra Algorithm for Shortest Path
function findShortestPath(startNodeId, endNodeId) {
    const graph = buildGraph();
    const distances = {};
    const previous = {};
    const nodes = new Set(Object.keys(graph));

    for (let vertex in graph) {
        if (vertex === startNodeId) {
            distances[vertex] = 0;
        } else {
            distances[vertex] = Infinity;
        }
        previous[vertex] = null;
    }

    while (nodes.size > 0) {
        let minDistance = Infinity;
        let smallest = null;

        for (let vertex of nodes) {
            if (distances[vertex] < minDistance) {
                minDistance = distances[vertex];
                smallest = vertex;
            }
        }

        if (smallest === null || smallest === endNodeId) break;
        nodes.delete(smallest);

        for (let neighbor in graph[smallest]) {
            let alt = distances[smallest] + graph[smallest][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = smallest;
            }
        }
    }

    const path = [];
    let current = endNodeId;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // Return empty if no path found (unreachable)
    return path.length > 1 ? path : [];
}

// 3. Render the 3D Map based on DB
function render3DMapNodes() {
    const floor = document.getElementById('map-floor');
    if (!floor) return;

    // Keep only the SVG, remove old hardcoded rooms
    Array.from(floor.children).forEach(child => {
        if (child.tagName.toLowerCase() !== 'svg') floor.removeChild(child);
    });

    MOCK_DATA.mapNodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'map-room';
        div.id = `room-${node.id}`;
        
        // Convert % coordinates to 3D isometric placement
        div.style.left = `${node.x}%`;
        div.style.top = `${node.y}%`;
        
        // Styling based on type
        if (node.type === 'hallway') {
            div.style.width = '60px';
            div.style.height = '60px';
            div.style.borderRadius = '50%';
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.color = 'var(--text-muted)';
            div.style.borderColor = 'rgba(255,255,255,0.1)';
            div.style.transform = 'translate(-50%, -50%)'; // center origin
            if (node.id === 'Entrance') {
                div.style.background = 'rgba(79, 70, 229, 0.3)';
                div.style.borderRadius = '12px';
            }
        } else {
            div.style.width = '120px';
            div.style.height = '100px';
            div.style.borderRadius = '12px';
            div.style.transform = 'translate(-50%, -50%)';
        }

        div.innerHTML = `<strong>${node.id}</strong><br><small>${node.label}</small>`;
        floor.appendChild(div);
    });
}

function handleFindPath() {
    const targetInput = mapRoomSearchEl.value.trim().toUpperCase();
    
    if (!targetInput) {
        showToast('Please enter a room number.');
        return;
    }

    // Attempt fuzzy match for rooms by ID or Label
    const targetNode = MOCK_DATA.mapNodes.find(n => 
        n.id.toUpperCase().includes(targetInput) || 
        n.label.toUpperCase().includes(targetInput)
    );
    
    if (!targetNode || targetNode.type === 'hallway') {
        showToast('Room not found! Try searching for a valid clinic room.');
        return;
    }

    // Reset target highlights
    document.querySelectorAll('.map-room').forEach(r => r.classList.remove('target'));
    const targetRoomEl = document.getElementById(`room-${targetNode.id}`);
    if (targetRoomEl) targetRoomEl.classList.add('target');

    // Run Dijkstra
    const pathNodes = findShortestPath('Entrance', targetNode.id);
    
    if (pathNodes.length === 0) {
        showToast('Path to room is currently blocked by maintenance.');
        directionsListEl.innerHTML = '<li class="text-muted"><i class="fas fa-exclamation-triangle" style="color:#ef4444"></i> Path unavailable. Access restricted by Manager.</li>';
        mapPathSvg.innerHTML = '';
        return;
    }

    // Translate Node Path to coordinates and instructions
    let pointsStr = '';
    const steps = [];
    
    pathNodes.forEach((nodeId, idx) => {
        const nodeObj = MOCK_DATA.mapNodes.find(n => n.id === nodeId);
        if (nodeObj) {
            // SVG coordinates: 600x600 floor plane
            pointsStr += `${(nodeObj.x * 600)/100},${(nodeObj.y * 600)/100} `;
            
            // Generate basic procedural steps
            if (idx === 0) {
                steps.push(`Start at ${nodeObj.label}.`);
            } else if (idx === pathNodes.length - 1) {
                steps.push(`Arrive at ${nodeObj.label} (${nodeObj.id}).`);
            } else {
                steps.push(`Proceed to ${nodeObj.label}.`);
            }
        }
    });
    
    // Draw SVG Path
    mapPathSvg.innerHTML = '';
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', pointsStr.trim());
    polyline.setAttribute('class', 'path-line');
    mapPathSvg.appendChild(polyline);

    // Render Directions
    directionsListEl.innerHTML = '';
    steps.forEach((step, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Step ${idx + 1}:</strong> ${step}`;
        li.style.padding = '0.75rem';
        li.style.background = 'rgba(0,0,0,0.2)';
        li.style.borderRadius = '8px';
        li.style.borderLeft = '3px solid var(--accent-color)';
        directionsListEl.appendChild(li);
    });

    // Handle Voice TTS
    if (voiceEnabled) speakDirections(steps);
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    if (voiceEnabled) {
        btnToggleVoice.innerHTML = '<i class="fas fa-volume-up"></i> Voice On';
        btnToggleVoice.style.background = 'var(--secondary-color)';
        btnToggleVoice.style.borderColor = 'var(--secondary-color)';
        btnToggleVoice.style.color = '#fff';
    } else {
        btnToggleVoice.innerHTML = '<i class="fas fa-volume-mute"></i> Voice Off';
        btnToggleVoice.style.background = 'transparent';
        btnToggleVoice.style.borderColor = 'var(--text-muted)';
        btnToggleVoice.style.color = 'var(--text-muted)';
        if('speechSynthesis' in window) speechSynthesis.cancel();
    }
}

function speakDirections(steps) {
    if (!('speechSynthesis' in window)) {
        showToast('Voice directions not supported by your browser.');
        return;
    }
    speechSynthesis.cancel();
    const textToSpeak = 'Path found. ' + steps.join('. ');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

// --- Event Listeners ---
function setupEventListeners() {
    if(navBtns.patient) navBtns.patient.addEventListener('click', () => switchView('patient'));
    if(navBtns.doctor) navBtns.doctor.addEventListener('click', () => switchView('doctor'));
    if(navBtns.manager) navBtns.manager.addEventListener('click', () => switchView('manager'));
    if(navBtns.map) navBtns.map.addEventListener('click', () => switchView('map'));
    
    primarySymptomEl.addEventListener('change', handleTriageChange);

    // Notification dropdown toggle
    notifWrapper.addEventListener('click', (e) => {
        notifDropdownEl.classList.toggle('hidden');
        // Mark all as read when opening
        if (!notifDropdownEl.classList.contains('hidden')) {
            MOCK_DATA.notifications.forEach(n => n.read = true);
            updateNotificationUI();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!notifWrapper.contains(e.target)) notifDropdownEl.classList.add('hidden');
    });
    
    searchInput.addEventListener('input', handleSearch);
    
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    bookingForm.addEventListener('submit', submitBooking);
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Manager Doctor CRUD Listeners
    if(btnAddDoctor) btnAddDoctor.addEventListener('click', () => openDoctorCrudModal());
    if(closeDocModalBtn) closeDocModalBtn.addEventListener('click', () => docCrudModal.classList.remove('show'));
    if(docCrudForm) docCrudForm.addEventListener('submit', saveDoctor);
    window.addEventListener('click', (e) => {
        if (e.target === docCrudModal) docCrudModal.classList.remove('show');
        if (e.target === triageCrudModal) triageCrudModal.classList.remove('show');
    });

    // Manager Triage Listeners
    if(btnAddTriage) btnAddTriage.addEventListener('click', () => openTriageModal());
    const closeTriageModalBtn = document.getElementById('close-triage-modal');
    if(closeTriageModalBtn) closeTriageModalBtn.addEventListener('click', () => triageCrudModal.classList.remove('show'));
    if(triageCrudForm) triageCrudForm.addEventListener('submit', saveTriageQuestion);

    // Map Listeners
    if(btnFindPath) btnFindPath.addEventListener('click', handleFindPath);
    if(btnToggleVoice) btnToggleVoice.addEventListener('click', toggleVoice);
    if(mapRoomSearchEl) mapRoomSearchEl.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleFindPath();
    });
}

// Start app
init();
